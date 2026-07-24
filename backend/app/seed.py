"""Seed initial database content from the live itemployeez.com site."""

from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.legal import LegalPage
from app.models.product import ProductCategory, ProductDetail
from app.models.service import Service
from app.models.user import User
from app.services.auth_service import hash_password

settings = get_settings()

BASE_IMAGE = "https://itemployeez.com/public/uploads/images"
HOME_IDS = {50, 49, 46, 44, 42, 37, 36, 35, 34}

# Names match live site breadcrumbs on /product/{id}
PRODUCTS = [
    (34, "Programing Languages", "programing-languages", f"{BASE_IMAGE}/1755680761.JPG", None),
    (35, "Apple", "apple", f"{BASE_IMAGE}/1755758215.png", "macOS"),
    (36, "Adobe", "adobe", f"{BASE_IMAGE}/1756084796.png", "Adobe Photoshop Express"),
    (37, "Amazon", "amazon", f"{BASE_IMAGE}/1756084812.png", None),
    (38, "AMD", "amd", f"{BASE_IMAGE}/1756084825.png", None),
    (39, "Atos", "atos", f"{BASE_IMAGE}/1756084849.png", None),
    (41, "Bosch", "bosch", f"{BASE_IMAGE}/1756084865.png", None),
    (42, "Cisco", "cisco", f"{BASE_IMAGE}/1756084879.png", None),
    (43, "Dell", "dell", f"{BASE_IMAGE}/1756084899.png", None),
    (44, "Google", "google", f"{BASE_IMAGE}/1756084990.png", None),
    (45, "HP", "hp", f"{BASE_IMAGE}/1756085053.png", None),
    (46, "IBM", "ibm", f"{BASE_IMAGE}/1756085070.png", None),
    (47, "Oracle", "oracle", f"{BASE_IMAGE}/1756085096.png", None),
    (48, "PEGA", "pega", f"{BASE_IMAGE}/1756085127.png", "Pega DevOps"),
    (49, "SAP", "sap", f"{BASE_IMAGE}/1756085143.jfif", "SAP ECC"),
    (50, "Intel", "intel", f"{BASE_IMAGE}/1756085221.png", None),
    (51, "Microsoft", "microsoft", f"{BASE_IMAGE}/1756085238.png", None),
]

PRODUCT_DETAILS = [
    {
        "slug": "SAP ECC",
        "title": "SAP ECC (ERP Central Component)",
        "subtitle": "Enterprise resource planning for SAP landscapes",
        "description": (
            "SAP ECC is the legacy ERP suite used by enterprises worldwide. "
            "Join this community to discuss implementation, migration to S/4HANA, "
            "ABAP development, and best practices.\n\n"
            "Key topics covered:\n"
            "- Basis administration\n"
            "- FI/CO modules\n"
            "- MM/SD workflows\n"
            "- Integration patterns for IT professionals"
        ),
        "image_url": f"{BASE_IMAGE}/1756485854.jpeg",
        "gallery_urls": f"{BASE_IMAGE}/1756085143.jfif,{BASE_IMAGE}/1756485854.jpeg",
        "category_id": 49,
        "price_paise": 9900,
        "billing_period": "yearly",
    },
    {
        "slug": "macOS",
        "title": "macOS",
        "subtitle": "Apple platform for developers and IT admins",
        "description": (
            "macOS powers creative and engineering workflows across the industry. "
            "Connect with admins and developers sharing deployment, security, "
            "and automation knowledge.\n\n"
            "Key topics covered:\n"
            "- MDM and device management\n"
            "- Shell scripting and automation\n"
            "- Xcode tooling for developers\n"
            "- Enterprise support workflows\n"
            "- Cross-platform development"
        ),
        "image_url": f"{BASE_IMAGE}/1755758277.jpeg",
        "gallery_urls": f"{BASE_IMAGE}/1755758215.png,{BASE_IMAGE}/1755758277.jpeg",
        "category_id": 35,
        "price_paise": 9900,
        "billing_period": "yearly",
    },
    {
        "slug": "Adobe Photoshop Express",
        "title": "Adobe Photoshop Express",
        "subtitle": "Photoshop – Image editing & graphic design",
        "description": (
            "Photoshop is the industry standard for image editing and graphic design. "
            "This community covers workflows, creative tooling, and design best practices.\n\n"
            "Key features covered:\n"
            "- Image editing fundamentals\n"
            "- Layers and masks\n"
            "- Graphic design workflows\n"
            "- Digital painting and drawing\n"
            "- AI-powered tools (Adobe Sensei)"
        ),
        "image_url": f"{BASE_IMAGE}/1756636212.webp",
        "gallery_urls": f"{BASE_IMAGE}/1756084796.png,{BASE_IMAGE}/1756636212.webp",
        "category_id": 36,
        "price_paise": 9900,
        "billing_period": "yearly",
    },
    {
        "slug": "Pega DevOps",
        "title": "Pega DevOps",
        "subtitle": "DevOps practices for Pega platforms",
        "description": (
            "PEGA DevOps brings CI/CD and release management to Pega applications. "
            "Share pipelines, testing strategies, and platform upgrades with peers.\n\n"
            "Key topics covered:\n"
            "- Deployment manager\n"
            "- Branch rules and merge policies\n"
            "- Quality gates and testing\n"
            "- Enterprise Pega operations"
        ),
        "image_url": f"{BASE_IMAGE}/1756635771.jpeg",
        "gallery_urls": f"{BASE_IMAGE}/1756085127.png,{BASE_IMAGE}/1756635771.jpeg",
        "category_id": 48,
        "price_paise": 9900,
        "billing_period": "yearly",
    },
]

SERVICES = [
    {
        "slug": "access-to-exclusive-resources",
        "title": "Access to Exclusive Resources",
        "excerpt": "Industry-leading tools, tutorials, and best practices tailored for IT professionals.",
        "content": (
            "As a member, you gain access to a wealth of resources, including industry-leading tools, "
            "tutorials, and best practices. Stay ahead of the curve with our up-to-date content tailored to your needs."
        ),
    },
    {
        "slug": "Career-Advancement",
        "title": "Career Advancement",
        "excerpt": "Job boards, skill-building workshops, and career support for IT professionals.",
        "content": (
            "Whether you're looking to advance in your current role or explore new opportunities, IT Employeez "
            "provides the support and resources to help you achieve your career goals. From job boards to "
            "skill-building workshops, we've got you covered."
        ),
    },
]

LEGAL_PAGES = [
    {
        "slug": "terms-conditions",
        "title": "Terms & Conditions for IT Employeez",
        "content": """Welcome to IT Emp. These Terms & Conditions outline the rules and regulations for the use of IT Emp's website and services.

**Definitions**
- "IT Emp" refers to the owner of the website and provider of services.
- "User" refers to any individual or entity accessing or using IT Emp's website and services.
- "Services" refer to the various services provided by IT Emp.

**Use of Services**
Users agree to provide accurate information and are responsible for account security.

**Intellectual Property**
All content on the IT Employeez website is owned by IT Employeez.

**Contact:** info@itemployeez.com""",
    },
    {
        "slug": "privacy-policy",
        "title": "Privacy Policy",
        "content": """Welcome to IT Emp! Your privacy is important to us.

We collect personal information (name, email, phone), professional information (job title, company), and usage data.

We use your information to provide and improve our services, communicate with you, and comply with legal obligations.

We do not share your personal information with third parties except trusted partners under confidentiality.

**Contact:** info@itemployeez.com""",
    },
    {
        "slug": "cancel-policies",
        "title": "Cancel Policy for IT Employeez",
        "content": """Cancellation requires a written request via email to info@itemployeez.com or through your account dashboard.

**Notice Period:** 30 days required for all cancellations.

**Refunds:** Full refund if cancelled within the first 15 days of subscription. No refunds after 15 days.

**Refund Processing:** Within 30 business days.

**Contact:** info@itemployeez.com""",
    },
    {
        "slug": "disclaimer",
        "title": "Disclaimer",
        "content": """The information on IT Employeez is provided for general informational purposes only.

IT Employeez makes no warranties about the completeness or accuracy of content. Use of the site and services is at your own risk.

**Contact:** info@itemployeez.com""",
    },
]


def seed_database(db: Session) -> None:
    """Insert missing rows and keep product names in sync with the live site."""
    for product_id, name, slug, image_url, detail_slug in PRODUCTS:
        existing = db.query(ProductCategory).filter(ProductCategory.id == product_id).first()
        description = (
            f"Share knowledge and explore {name} topics with fellow IT professionals "
            f"in the IT Employeez community."
        )
        if existing:
            existing.name = name
            existing.slug = slug
            existing.image_url = image_url
            existing.description = description
            existing.product_detail_slug = detail_slug
            existing.show_on_home = product_id in HOME_IDS
        else:
            db.add(
                ProductCategory(
                    id=product_id,
                    name=name,
                    slug=slug,
                    image_url=image_url,
                    description=description,
                    product_detail_slug=detail_slug,
                    show_on_home=product_id in HOME_IDS,
                )
            )

    for item in PRODUCT_DETAILS:
        existing = db.query(ProductDetail).filter(ProductDetail.slug == item["slug"]).first()
        if existing:
            existing.title = item["title"]
            existing.subtitle = item.get("subtitle")
            existing.description = item["description"]
            existing.image_url = item["image_url"]
            existing.gallery_urls = item["gallery_urls"]
            existing.category_id = item["category_id"]
            existing.price_paise = item.get("price_paise", 9900)
            existing.billing_period = item.get("billing_period", "yearly")
        else:
            db.add(ProductDetail(**item))

    if db.query(Service).count() == 0:
        for item in SERVICES:
            db.add(Service(**item))

    if db.query(LegalPage).count() == 0:
        for item in LEGAL_PAGES:
            db.add(LegalPage(**item))

    admin = db.query(User).filter(User.email == settings.subadmin_email).first()
    if not admin:
        db.add(
            User(
                name="Sub Admin",
                email=settings.subadmin_email,
                password_hash=hash_password(settings.subadmin_password),
                role="sub_admin",
            )
        )

    db.commit()
