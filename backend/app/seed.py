"""Seed initial database content from the live itemployeez.com site."""

from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.cms import Banner, SiteSetting
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
        "content": """Welcome to IT Emp. These Terms & Conditions outline the rules and regulations for the use of IT Emp's website and services. By accessing this website and using our services, you agree to comply with and be bound by these terms.

**2. Definitions**
- "IT Emp" refers to the owner of the website and provider of services.
- "User" refers to any individual or entity accessing or using IT Emp's website and services.
- "Services" refer to the various services provided by IT Emp, including but not limited to IT solutions, consulting, and resources.

**3. Use of Services**
- Users agree to provide accurate and up-to-date information when registering for an account or using our services.
- Users are responsible for maintaining the confidentiality of their account credentials and are liable for any activities under their account.

**4. Intellectual Property**
- All content, including text, graphics, logos, and software, on the IT Employeez website is the property of IT Employeez and is protected by intellectual property laws.
- Users may not reproduce, distribute, or create derivative works from any content on the IT Employeez website without explicit permission.

**5. Privacy**
IT Employeez is committed to protecting users' privacy. Our Privacy Policy outlines how we collect, use, and protect your personal information.

**6. Limitation of Liability**
- IT Employeez is not liable for any direct, indirect, incidental, or consequential damages arising from the use of our services or inability to use our services.
- IT Employeez makes no warranties or representations about the accuracy or completeness of the content on our website or the reliability of our services.

**7. Termination**
IT Employeez reserves the right to terminate or suspend a user's account and access to our services at any time, without notice, for any reason, including but not limited to breach of these Terms & Conditions.

**8. Governing Law**
These Terms & Conditions are governed by and construed in accordance with applicable laws, and any disputes arising out of or relating to these terms will be subject to the exclusive jurisdiction of the competent courts.

**9. Changes to Terms & Conditions**
IT Employeez reserves the right to update or modify these Terms & Conditions at any time. Users are encouraged to review these terms periodically. Continued use of our services after any changes constitutes acceptance of the new terms.

**10. Contact Us**
If you have any questions or concerns about these Terms & Conditions, please contact us at info@itemployeez.com.""",
    },
    {
        "slug": "privacy-policy",
        "title": "Privacy Policy",
        "content": """Welcome to IT Emp! Your privacy is important to us. This Privacy Policy outlines how we collect, use, and protect your personal information. By using our services, you agree to the terms of this policy.

**2. Information We Collect**
We collect information to provide and improve our services. This may include:
- Personal information (name, email address, phone number)
- Professional information (job title, company, industry)
- Usage data (IP address, browser type, operating system)

**3. How We Use Your Information**
We use your information to:
- Provide and improve our services
- Communicate with you about our services
- Personalize your experience
- Respond to your inquiries
- Comply with legal obligations

**4. Sharing Your Information**
We do not share your personal information with third parties except as described in this policy. We may share information with trusted partners to provide services on our behalf, but only if they agree to keep this information confidential.

**5. Data Security**
We take reasonable measures to protect your information from unauthorized access, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, so we cannot guarantee its absolute security.

**6. Your Rights**
You have the right to access, correct, or delete your personal information. You can also request a copy of your data or withdraw consent for its use at any time.

**7. Changes to This Policy**
We may update this policy from time to time. We will notify you of any significant changes and encourage you to review the policy periodically.

**8. Contact Us**
If you have any questions or concerns about this policy, please contact us at info@itemployeez.com.""",
    },
    {
        "slug": "cancel-policies",
        "title": "Cancellation & Refund Policy",
        "content": """We understand that circumstances may change, and you may need to cancel your services with IT Emp. This Cancel Policy outlines the terms and conditions for cancelling our services. By using our services, you agree to this policy.

**2. Cancellation Request**
- To cancel your services, please submit a written cancellation request via email to info@itemployeez.com or through your account dashboard on our website.
- Please include your account details and reason for cancellation in your request.

**3. Notice Period**
A notice period of 30 days is required for all service cancellations. This allows us to process your request and ensure a smooth transition.

**4. Refunds**
- If you cancel your services within the first 15 days of subscription, you may be eligible for a full refund. After the initial 15 days, no refunds will be issued for the remaining subscription period.
- Refunds will be processed within 30 business days of receiving the cancellation request.

**5. Service Termination**
Upon cancellation, your access to IT Employeez services will be terminated at the end of the notice period. You will no longer be able to access your account or any associated services.

**6. Outstanding Payments**
Any outstanding payments or dues must be settled before the cancellation is processed. Failure to do so may result in additional charges or legal action.

**7. Data Retention and Deletion**
Upon termination of services, your data will be retained for a period of 30 days. After this period, all data will be permanently deleted from our systems. It is your responsibility to back up any data before cancellation.

**8. Changes to Cancel Policy**
IT Employeez reserves the right to update or modify this Cancel Policy at any time. Any changes will be communicated to you, and continued use of our services constitutes acceptance of the new terms.

**9. Contact Us**
If you have any questions or concerns about this Cancel Policy, please contact us at info@itemployeez.com.""",
    },
    {
        "slug": "disclaimer",
        "title": "Disclaimer",
        "content": """**Disclaimer for IT Employeez**

This portal is intended for informational purposes only and does not constitute a legally binding agreement. The policies, procedures, and guidelines outlined herein are subject to change at the discretion of the company without prior notice.

The company is not responsible for any personal data stored on company devices or networks. Employees are advised to back up personal data and use company resources responsibly.

The information on IT Employeez is provided for general informational purposes only. IT Employeez makes no warranties about the completeness or accuracy of content. Use of the site and services is at your own risk.

This disclaimer does not create any contractual rights or obligations between the company and its employees or members. For further clarification, please contact us at info@itemployeez.com.""",
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

    for item in LEGAL_PAGES:
        existing = db.query(LegalPage).filter(LegalPage.slug == item["slug"]).first()
        if existing:
            existing.title = item["title"]
            existing.content = item["content"]
        else:
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

    if db.query(Banner).count() == 0:
        db.add(
            Banner(
                title="Become Part Of Our Vibrant IT Community!",
                image_url=f"{BASE_IMAGE}/1755680761.JPG",
                link_url="/signup",
                sort_order=1,
                is_active=True,
            )
        )

    default_settings = [
        ("contact_phone", "+91-8712956595", "Primary Phone"),
        ("contact_phone_alt", "+91-8712956594", "Alternate Phone"),
        ("contact_whatsapp", "918712956594", "WhatsApp"),
        ("contact_email", "santu.edi@gmail.com", "Email"),
        ("contact_address", "Visakhapatnam, India", "Address"),
        ("about_title", "About Us", "About Title"),
        (
            "about_content",
            (
                "The IT Employeez Community is a vibrant network designed for IT professionals to "
                "connect, collaborate, and grow. Whether you're a developer, sysadmin, cybersecurity "
                "expert, or tech enthusiast, this community provides a platform for knowledge sharing, "
                "career advice, and industry trends.\n\n"
                "With a focus on peer support, skill development, and networking, the IT Employeez "
                "Community fosters innovation and problem-solving. Join a global community of "
                "like-minded individuals and be part of a dynamic space where technology meets opportunity!"
            ),
            "About Content",
        ),
        ("default_subscription_price_paise", "9900", "Default Subscription Amount (paise)"),
    ]
    for key, value, label in default_settings:
        existing = db.query(SiteSetting).filter(SiteSetting.key == key).first()
        if not existing:
            db.add(SiteSetting(key=key, value=value, label=label))

    db.commit()
