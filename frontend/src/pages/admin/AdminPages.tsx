import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "@/services/api";
import type {
  Banner,
  Candidate,
  ContactDetails,
  ContactMessage,
  DashboardStats,
  LegalPage,
  PaymentHistoryItem,
  ProductCategory,
  ProductDetail,
  Service,
  User,
} from "@/types";
import { AdminPageHeader } from "./AdminLayout";
import { AdminContentEditor } from "./AdminContentEditor";
import "../AuthPages.css";
import "./AdminLayout.css";

function useAdminLoad<T>(loader: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    loader()
      .then((result) => {
        if (alive) setData(result);
      })
      .catch((err) => {
        if (alive) setError(err instanceof Error ? err.message : "Failed to load");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { data, loading, error, reload: () => setTick((t) => t + 1), setData };
}

export function AdminDashboardHome() {
  const { data, loading, error } = useAdminLoad<DashboardStats>(() => api.adminStats());

  const formatDate = (value?: string | null) => {
    if (!value) return "—";
    return new Date(value).toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <div className="admin-panel admin-welcome">
        <h1>Welcome!</h1>
        <p>Admin Dashboard</p>
        {loading ? <p className="admin-muted">Loading stats...</p> : null}
        {error ? <p className="admin-error">{error}</p> : null}
        {data ? (
          <div className="admin-stats">
            {(
              [
                ["Categories", data.categories, "stat-rose"],
                ["Products", data.products, "stat-blue"],
                ["Services", data.services, "stat-violet"],
                ["Candidates", data.candidates, "stat-teal"],
                ["Messages", data.messages, "stat-amber"],
                ["Payments", data.payments, "stat-indigo"],
                ["Banners", data.banners, "stat-cyan"],
                ["Sub Admins", data.sub_admins, "stat-slate"],
              ] as const
            ).map(([label, value, tone]) => (
              <div key={label} className={`admin-stat-card ${tone}`}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {data ? (
        <div className="admin-dash-grid">
          <div className="admin-panel">
            <div className="admin-dash-section-head">
              <div>
                <h2>Recent Joins</h2>
                <p>Users who registered recently</p>
              </div>
              <Link to="/admin/candidates" className="admin-dash-link">
                View all
              </Link>
            </div>
            {(data.recent_joins || []).length === 0 ? (
              <p className="admin-muted">No members have joined yet.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Job</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_joins.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <strong>{user.name}</strong>
                        </td>
                        <td>{user.email}</td>
                        <td>{user.job_title || "—"}</td>
                        <td>{formatDate(user.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="admin-panel">
            <div className="admin-dash-section-head">
              <div>
                <h2>Recent Subscriptions</h2>
                <p>Latest community memberships</p>
              </div>
              <Link to="/admin/payments" className="admin-dash-link">
                View all
              </Link>
            </div>
            {(data.recent_subscriptions || []).length === 0 ? (
              <p className="admin-muted">No subscriptions yet.</p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Community</th>
                      <th>Status</th>
                      <th>Subscribed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_subscriptions.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.user_name}</strong>
                          <br />
                          <span className="admin-muted">{item.user_email}</span>
                        </td>
                        <td>{item.product_title}</td>
                        <td>
                          <span className={`admin-badge ${item.status === "active" ? "ok" : ""}`}>
                            {item.status}
                          </span>
                        </td>
                        <td>{formatDate(item.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

export function AdminBannersPage() {
  const emptyForm = { title: "", image_url: "", link_url: "", sort_order: 0, is_active: true };
  const { data, loading, error, reload } = useAdminLoad<Banner[]>(() => api.adminListBanners());
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const resetForm = () => {
    setEditId(null);
    setForm(emptyForm);
  };

  const startEdit = (banner: Banner) => {
    setEditId(banner.id);
    setForm({
      title: banner.title,
      image_url: banner.image_url,
      link_url: banner.link_url || "",
      sort_order: banner.sort_order,
      is_active: banner.is_active,
    });
    setMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      if (editId != null) {
        await api.adminUpdateBanner(editId, form);
        setMsg("Banner updated");
      } else {
        await api.adminCreateBanner(form);
        setMsg("Banner created");
      }
      resetForm();
      reload();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminPageHeader title="Banner List" subtitle="Homepage and marketing banners" />
      <div className="admin-panel" style={{ marginBottom: "1rem" }}>
        <form className="admin-form" onSubmit={save}>
          <p className="admin-muted" style={{ margin: 0 }}>
            {editId != null ? `Editing banner #${editId}` : "Add a new banner"}
          </p>
          <div className="admin-form-row">
            <label>
              Title
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </label>
            <label>
              Sort order
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
              />
            </label>
          </div>
          <label>
            Image URL
            <input
              required
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
          </label>
          <label>
            Link URL
            <input
              value={form.link_url}
              onChange={(e) => setForm({ ...form, link_url: e.target.value })}
            />
          </label>
          <label>
            <span>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />{" "}
              Active
            </span>
          </label>
          {msg ? (
            <p className={msg.toLowerCase().includes("fail") ? "admin-error" : "admin-success"}>{msg}</p>
          ) : null}
          <div className="admin-actions">
            <button className="admin-btn admin-btn-primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : editId != null ? "Update Banner" : "Add Banner"}
            </button>
            {editId != null ? (
              <button type="button" className="admin-btn admin-btn-ghost" onClick={resetForm}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </div>
      <div className="admin-panel">
        {loading ? <p>Loading...</p> : null}
        {error ? <p className="admin-error">{error}</p> : null}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Link</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {(data || []).map((banner) => (
                <tr key={banner.id}>
                  <td>
                    <img className="thumb" src={banner.image_url} alt="" />
                  </td>
                  <td>{banner.title}</td>
                  <td>{banner.link_url || "—"}</td>
                  <td>
                    <span className={`admin-badge ${banner.is_active ? "ok" : "off"}`}>
                      {banner.is_active ? "Active" : "Off"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button type="button" className="admin-btn admin-btn-accent" onClick={() => startEdit(banner)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn-danger"
                        onClick={async () => {
                          await api.adminDeleteBanner(banner.id);
                          if (editId === banner.id) resetForm();
                          reload();
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export function AdminContactDetailsPage() {
  const { data, loading, error, setData } = useAdminLoad<ContactDetails>(() =>
    api.adminGetContactDetails(),
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  if (loading || !data) {
    return (
      <div className="admin-panel">
        {loading ? <p>Loading...</p> : null}
        {error ? <p className="admin-error">{error}</p> : null}
      </div>
    );
  }

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      const updated = await api.adminUpdateContactDetails(data);
      setData(updated);
      setMsg("Contact details saved");
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminPageHeader title="Contact Details" subtitle="Phone, email, and address shown on the site" />
      <div className="admin-panel">
        <form className="admin-form" onSubmit={save}>
          <div className="admin-form-row">
            <label>
              Primary phone
              <input
                value={data.phone}
                onChange={(e) => setData({ ...data, phone: e.target.value })}
              />
            </label>
            <label>
              Alternate phone
              <input
                value={data.phone_alt}
                onChange={(e) => setData({ ...data, phone_alt: e.target.value })}
              />
            </label>
          </div>
          <div className="admin-form-row">
            <label>
              WhatsApp
              <input
                value={data.whatsapp}
                onChange={(e) => setData({ ...data, whatsapp: e.target.value })}
              />
            </label>
            <label>
              Email
              <input
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
              />
            </label>
          </div>
          <label>
            Address
            <textarea
              value={data.address}
              onChange={(e) => setData({ ...data, address: e.target.value })}
            />
          </label>
          {msg ? <p className="admin-success">{msg}</p> : null}
          <button className="admin-btn admin-btn-primary" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Contact Details"}
          </button>
        </form>
      </div>
    </>
  );
}

export function AdminSubAdminsPage() {
  const emptyForm = { name: "", email: "", password: "", phone: "" };
  const { data, loading, error, reload } = useAdminLoad<User[]>(() => api.adminListSubAdmins());
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const resetForm = () => {
    setEditId(null);
    setForm(emptyForm);
  };

  const startEdit = (user: User) => {
    setEditId(user.id);
    setForm({ name: user.name, email: user.email, password: "", phone: user.phone || "" });
    setMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      if (editId != null) {
        const body: Record<string, unknown> = {
          name: form.name,
          phone: form.phone || null,
        };
        if (form.password.trim()) body.password = form.password;
        await api.adminUpdateSubAdmin(editId, body);
        setMsg("Sub-admin updated");
      } else {
        await api.adminCreateSubAdmin(form);
        setMsg("Sub-admin created");
      }
      resetForm();
      reload();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminPageHeader title="Sub Admin List" />
      <div className="admin-panel" style={{ marginBottom: "1rem" }}>
        <form className="admin-form" onSubmit={save}>
          <p className="admin-muted" style={{ margin: 0 }}>
            {editId != null ? `Editing sub-admin #${editId}` : "Add a new sub-admin"}
          </p>
          <div className="admin-form-row">
            <label>
              Name
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>
              Email
              <input
                required
                type="email"
                disabled={editId != null}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
          </div>
          <div className="admin-form-row">
            <label>
              Password {editId != null ? "(leave blank to keep)" : ""}
              <input
                required={editId == null}
                type="password"
                minLength={editId == null ? 8 : undefined}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>
            <label>
              Phone
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </label>
          </div>
          {msg ? (
            <p className={msg.toLowerCase().includes("fail") ? "admin-error" : "admin-success"}>{msg}</p>
          ) : null}
          <div className="admin-actions">
            <button className="admin-btn admin-btn-primary" type="submit" disabled={saving}>
              {editId != null ? "Update Sub Admin" : "Add Sub Admin"}
            </button>
            {editId != null ? (
              <button type="button" className="admin-btn admin-btn-ghost" onClick={resetForm}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </div>
      <div className="admin-panel">
        {loading ? <p>Loading...</p> : null}
        {error ? <p className="admin-error">{error}</p> : null}
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(data || []).map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone || "—"}</td>
                <td>
                  <div className="admin-actions">
                    <button type="button" className="admin-btn admin-btn-accent" onClick={() => startEdit(user)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-danger"
                      onClick={async () => {
                        try {
                          await api.adminDeleteSubAdmin(user.id);
                          if (editId === user.id) resetForm();
                          reload();
                        } catch (err) {
                          setMsg(err instanceof Error ? err.message : "Delete failed");
                        }
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function AdminSubscriptionAmountPage() {
  const { data, loading, error, reload } = useAdminLoad<ProductDetail[]>(() => api.adminListProducts());
  const [msg, setMsg] = useState("");

  return (
    <>
      <AdminPageHeader
        title="Subscription Amount"
        subtitle="Edit yearly/monthly subscription prices (stored in paise)"
      />
      <div className="admin-panel">
        {loading ? <p>Loading...</p> : null}
        {error ? <p className="admin-error">{error}</p> : null}
        {msg ? <p className="admin-success">{msg}</p> : null}
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price (₹)</th>
              <th>Period</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(data || []).map((product) => (
              <SubscriptionRow
                key={product.id}
                product={product}
                onSaved={() => {
                  setMsg("Amount updated");
                  reload();
                }}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function SubscriptionRow({
  product,
  onSaved,
}: {
  product: ProductDetail;
  onSaved: () => void;
}) {
  const [rupees, setRupees] = useState(String(product.price_paise / 100));
  const [period, setPeriod] = useState(product.billing_period);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!/^\d*\.?\d*$/.test(val)) {
      return;
    }
    const digitCount = val.replace('.', '').length;

    setError('');
    if (val.startsWith("0") && val.length > 1 && !val.startsWith("0.")) {
      setError("Do not start with 0.");
      return;
    }
    if (digitCount > 7) {
      setError('Max 7 digits.');
      return;
    }
    if (digitCount <= 7 || val === '') {
      setRupees(val);
    }
  };

  return (
    <tr>
      <td>{product.title}</td>
      <td>
       <input
          type="text"
          inputMode="decimal"
          value={rupees}
          onChange={handleChange}
          style={{ width: 100, border: error ? '1px thin solid red' : '1px solid #ccc'}}
       />
       {error && (
        <div style={{ color: 'red', fontSize: '10px', fontFamily: 'sans-serif' }}>
          {error}
        </div>
       )}
      </td>
      <td>
        <select value={period} onChange={(e) => setPeriod(e.target.value)}>
          <option value="yearly">Yearly</option>
          <option value="monthly">Monthly</option>
        </select>
      </td>
      <td>
        <button
          type="button"
          className="admin-btn admin-btn-accent"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            try {
              await api.adminUpdateSubscriptionAmount(product.id, {
                price_paise: Math.round(Number(rupees) * 100),
                billing_period: period,
              });
              onSaved();
            } finally {
              setSaving(false);
            }
          }}
        >
          Save
        </button>
      </td>
    </tr>
  );
}

export function AdminCategoriesPage() {
  const emptyForm = {
    name: "",
    slug: "",
    image_url: "",
    description: "",
    show_on_home: false,
  };
  const { data, loading, error, reload } = useAdminLoad<ProductCategory[]>(() =>
    api.adminListCategories(),
  );
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [msg, setMsg] = useState("");

  const resetForm = () => {
    setEditId(null);
    setForm(emptyForm);
  };

  const startEdit = (cat: ProductCategory) => {
    setEditId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      image_url: cat.image_url,
      description: cat.description || "",
      show_on_home: cat.show_on_home,
    });
    setMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    try {
      if (editId != null) {
        await api.adminUpdateCategory(editId, form);
        setMsg("Category updated");
      } else {
        await api.adminCreateCategory(form);
        setMsg("Category created");
      }
      resetForm();
      reload();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Save failed");
    }
  };

  return (
    <>
      <AdminPageHeader title="Category List" />
      <div className="admin-panel" style={{ marginBottom: "1rem" }}>
        <form className="admin-form" onSubmit={save}>
          <p className="admin-muted" style={{ margin: 0 }}>
            {editId != null ? `Editing category #${editId}` : "Add a new category"}
          </p>
          <div className="admin-form-row">
            <label>
              Name
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label>
              Slug
              <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </label>
          </div>
          <label>
            Image URL
            <input
              required
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
          </label>
          <label>
            Description
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <label>
            <input
              type="checkbox"
              checked={form.show_on_home}
              onChange={(e) => setForm({ ...form, show_on_home: e.target.checked })}
            />{" "}
            Show on home
          </label>
          {msg ? (
            <p className={msg.toLowerCase().includes("fail") ? "admin-error" : "admin-success"}>{msg}</p>
          ) : null}
          <div className="admin-actions">
            <button className="admin-btn admin-btn-primary" type="submit">
              {editId != null ? "Update Category" : "Add Category"}
            </button>
            {editId != null ? (
              <button type="button" className="admin-btn admin-btn-ghost" onClick={resetForm}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </div>
      <div className="admin-panel">
        {loading ? <p>Loading...</p> : null}
        {error ? <p className="admin-error">{error}</p> : null}
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Home</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(data || []).map((cat) => (
              <tr key={cat.id}>
                <td>{cat.id}</td>
                <td>
                  <img className="thumb" src={cat.image_url} alt="" />
                </td>
                <td>{cat.name}</td>
                <td>{cat.slug}</td>
                <td>{cat.show_on_home ? "Yes" : "No"}</td>
                <td>
                  <div className="admin-actions">
                    <button type="button" className="admin-btn admin-btn-accent" onClick={() => startEdit(cat)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-danger"
                      onClick={async () => {
                        await api.adminDeleteCategory(cat.id);
                        if (editId === cat.id) resetForm();
                        reload();
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function AdminProductsPage() {
  const emptyForm = {
    slug: "",
    title: "",
    subtitle: "",
    description: "",
    image_url: "",
    category_id: "" as string | number,
    price_paise: 9900,
    billing_period: "yearly",
  };
  const { data, loading, error, reload } = useAdminLoad<ProductDetail[]>(() => api.adminListProducts());
  const cats = useAdminLoad<ProductCategory[]>(() => api.adminListCategories());
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [msg, setMsg] = useState("");

  const resetForm = () => {
    setEditId(null);
    setForm(emptyForm);
  };

  const startEdit = (p: ProductDetail) => {
    setEditId(p.id);
    setForm({
      slug: p.slug,
      title: p.title,
      subtitle: p.subtitle || "",
      description: p.description || "",
      image_url: p.image_url,
      category_id: p.category_id ?? "",
      price_paise: p.price_paise,
      billing_period: p.billing_period,
    });
    setMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    const payload = {
      ...form,
      category_id: form.category_id === "" ? null : Number(form.category_id),
    };
    try {
      if (editId != null) {
        await api.adminUpdateProduct(editId, payload);
        setMsg("Product updated");
      } else {
        await api.adminCreateProduct(payload);
        setMsg("Product created");
      }
      resetForm();
      reload();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Save failed");
    }
  };

  return (
    <>
      <AdminPageHeader title="Product List" />
      <div className="admin-panel" style={{ marginBottom: "1rem" }}>
        <form className="admin-form" onSubmit={save}>
          <p className="admin-muted" style={{ margin: 0 }}>
            {editId != null ? `Editing product #${editId}` : "Add a new product"}
          </p>
          <div className="admin-form-row">
            <label>
              Title
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </label>
            <label>
              Slug
              <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </label>
          </div>
          <div className="admin-form-row">
            <label>
              Subtitle
              <input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
            </label>
            <label>
              Category
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              >
                <option value="">None</option>
                {(cats.data || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            Image URL
            <input
              required
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
          </label>
          <label>
            Description
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          {msg ? (
            <p className={msg.toLowerCase().includes("fail") ? "admin-error" : "admin-success"}>{msg}</p>
          ) : null}
          <div className="admin-actions">
            <button className="admin-btn admin-btn-primary" type="submit">
              {editId != null ? "Update Product" : "Add Product"}
            </button>
            {editId != null ? (
              <button type="button" className="admin-btn admin-btn-ghost" onClick={resetForm}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </div>
      <div className="admin-panel">
        {loading ? <p>Loading...</p> : null}
        {error ? <p className="admin-error">{error}</p> : null}
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Category</th>
              <th>Price</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(data || []).map((p) => (
              <tr key={p.id}>
                <td>
                  <img className="thumb" src={p.image_url} alt="" />
                </td>
                <td>{p.title}</td>
                <td>{p.category_name || "—"}</td>
                <td>₹{(p.price_paise / 100).toFixed(0)}</td>
                <td>
                  <div className="admin-actions">
                    <button type="button" className="admin-btn admin-btn-accent" onClick={() => startEdit(p)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-danger"
                      onClick={async () => {
                        await api.adminDeleteProduct(p.id);
                        if (editId === p.id) resetForm();
                        reload();
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function AdminAboutPage() {
  const { data, loading, error, setData } = useAdminLoad<{ title: string; content: string }>(() =>
    api.adminGetAbout(),
  );
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  if (loading || !data) {
    return (
      <div className="admin-panel">
        {loading ? <p>Loading...</p> : null}
        {error ? <p className="admin-error">{error}</p> : null}
      </div>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="About Us"
        subtitle="Edit the About page content shown on the public website"
      />
      <AdminContentEditor
        title={data.title}
        content={data.content}
        onTitleChange={(value) => setData({ ...data, title: value })}
        onContentChange={(value) => setData({ ...data, content: value })}
        saving={saving}
        message={msg}
        submitLabel="Save About Us"
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          setMsg("");
          try {
            const updated = await api.adminUpdateAbout(data);
            setData(updated);
            setMsg("About page saved");
          } catch (err) {
            setMsg(err instanceof Error ? err.message : "Save failed");
          } finally {
            setSaving(false);
          }
        }}
      />
    </>
  );
}

export function AdminLegalEditPage() {
  const { slug = "" } = useParams();
  const { data, loading, error, setData } = useAdminLoad<LegalPage & { id?: number }>(
    () => api.adminGetLegal(slug),
    [slug],
  );
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const titles: Record<string, string> = {
    "privacy-policy": "Privacy & Policy",
    "terms-conditions": "Terms & Conditions",
    "cancel-policies": "Refund Policy",
    disclaimer: "Disclaimer",
  };

  if (loading || !data) {
    return (
      <div className="admin-panel">
        {loading ? <p>Loading...</p> : null}
        {error ? <p className="admin-error">{error}</p> : null}
      </div>
    );
  }

  return (
    <>
      <AdminPageHeader
        title={titles[slug] || data.title}
        subtitle="Edit content, then switch to Preview to see how it looks publicly"
      />
      <AdminContentEditor
        title={data.title}
        content={data.content}
        previewHeading={data.title}
        onTitleChange={(value) => setData({ ...data, title: value })}
        onContentChange={(value) => setData({ ...data, content: value })}
        saving={saving}
        message={msg}
        submitLabel="Save Page"
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          setMsg("");
          try {
            const updated = await api.adminUpdateLegal(slug, {
              title: data.title,
              content: data.content,
            });
            setData(updated);
            setMsg("Page content saved");
          } catch (err) {
            setMsg(err instanceof Error ? err.message : "Save failed");
          } finally {
            setSaving(false);
          }
        }}
      />
    </>
  );
}

export function AdminServicesPage() {
  const emptyForm = { slug: "", title: "", excerpt: "", content: "" };
  const { data, loading, error, reload } = useAdminLoad<Service[]>(() => api.adminListServices());
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [msg, setMsg] = useState("");

  const resetForm = () => {
    setEditId(null);
    setForm(emptyForm);
  };

  const startEdit = (s: Service) => {
    setEditId(s.id);
    setForm({ slug: s.slug, title: s.title, excerpt: s.excerpt, content: s.content });
    setMsg("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <AdminPageHeader title="Service List" />
      <div className="admin-panel" style={{ marginBottom: "1rem" }}>
        <form
          className="admin-form"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              if (editId != null) {
                await api.adminUpdateService(editId, form);
                setMsg("Service updated");
              } else {
                await api.adminCreateService(form);
                setMsg("Service created");
              }
              resetForm();
              reload();
            } catch (err) {
              setMsg(err instanceof Error ? err.message : "Save failed");
            }
          }}
        >
          <p className="admin-muted" style={{ margin: 0 }}>
            {editId != null ? `Editing service #${editId}` : "Add a new service"}
          </p>
          <div className="admin-form-row">
            <label>
              Title
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </label>
            <label>
              Slug
              <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </label>
          </div>
          <label>
            Excerpt
            <textarea required value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          </label>
          <label>
            Content
            <textarea required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </label>
          {msg ? (
            <p className={msg.toLowerCase().includes("fail") ? "admin-error" : "admin-success"}>{msg}</p>
          ) : null}
          <div className="admin-actions">
            <button className="admin-btn admin-btn-primary" type="submit">
              {editId != null ? "Update Service" : "Add Service"}
            </button>
            {editId != null ? (
              <button type="button" className="admin-btn admin-btn-ghost" onClick={resetForm}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </div>
      <div className="admin-panel">
        {loading ? <p>Loading...</p> : null}
        {error ? <p className="admin-error">{error}</p> : null}
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(data || []).map((s) => (
              <tr key={s.id}>
                <td>{s.title}</td>
                <td>{s.slug}</td>
                <td>
                  <div className="admin-actions">
                    <button type="button" className="admin-btn admin-btn-accent" onClick={() => startEdit(s)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-danger"
                      onClick={async () => {
                        await api.adminDeleteService(s.id);
                        if (editId === s.id) resetForm();
                        reload();
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function AdminMessagesPage({ title = "Messages List" }: { title?: string }) {
  const { data, loading, error, reload } = useAdminLoad<ContactMessage[]>(() => api.adminListMessages());

  return (
    <>
      <AdminPageHeader title={title} subtitle="Contact form submissions" />
      <div className="admin-panel">
        {loading ? <p>Loading...</p> : null}
        {error ? <p className="admin-error">{error}</p> : null}
        {!loading && (data || []).length === 0 ? <p className="admin-muted">No messages yet.</p> : null}
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Subject</th>
              <th>Message</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(data || []).map((m) => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td>{m.email}</td>
                <td>{m.subject || "—"}</td>
                <td>{m.message}</td>
                <td>
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger"
                    onClick={async () => {
                      if (m.id != null) {
                        await api.adminDeleteMessage(m.id);
                        reload();
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function AdminCandidatesPage() {
  const { data, loading, error, reload } = useAdminLoad<Candidate[]>(() => api.adminListCandidates());

  return (
    <>
      <AdminPageHeader title="Candidate Details" subtitle="Registered members" />
      <div className="admin-panel">
        {loading ? <p>Loading...</p> : null}
        {error ? <p className="admin-error">{error}</p> : null}
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Job title</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {(data || []).map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.email}</td>
                <td>{c.phone || "—"}</td>
                <td>{c.job_title || "—"}</td>
                <td>
                  <span className={`admin-badge ${c.is_active ? "ok" : "off"}`}>
                    {c.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="admin-btn admin-btn-ghost"
                    onClick={async () => {
                      await api.adminToggleCandidate(c.id);
                      reload();
                    }}
                  >
                    Toggle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function AdminPaymentsPage() {
  const { data, loading, error } = useAdminLoad<PaymentHistoryItem[]>(() => api.adminListPayments());

  return (
    <>
      <AdminPageHeader title="Payment History" subtitle="Community membership / subscription payments" />
      <div className="admin-panel">
        {loading ? <p>Loading...</p> : null}
        {error ? <p className="admin-error">{error}</p> : null}
        {!loading && (data || []).length === 0 ? (
          <p className="admin-muted">No payment records yet.</p>
        ) : null}
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Product</th>
              <th>Status</th>
              <th>Razorpay ID</th>
              <th>Period end</th>
            </tr>
          </thead>
          <tbody>
            {(data || []).map((p) => (
              <tr key={p.id}>
                <td>
                  {p.user_name}
                  <br />
                  <span className="admin-muted">{p.user_email}</span>
                </td>
                <td>{p.product_title}</td>
                <td>
                  <span className="admin-badge">{p.status}</span>
                </td>
                <td>{p.razorpay_subscription_id || "—"}</td>
                <td>{p.current_period_end ? new Date(p.current_period_end).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/** Legacy dashboard kept as redirect target content */
export function SubAdminDashboardPage() {
  return <AdminDashboardHome />;
}
