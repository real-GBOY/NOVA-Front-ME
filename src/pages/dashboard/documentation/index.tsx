/** @format */

import { DocumentationPage, type DocumentationTab } from "@/components/documentation";
import { FileText } from "@/Icons";
import { useLanguage } from "@/hooks/useLanguage";

function DocumentationPageView() {
	const { language } = useLanguage();

	// Documentation data with bilingual support
	const documentationTabs: DocumentationTab[] = [
		{
			id: "introduction",
			label: language === "ar" ? "مقدمة النظام" : "System Introduction",
			icon: FileText,
			content: {
						title:
							language === "ar"
								? "مقدمة النظام"
								: "System Introduction",
						text:
							language === "ar"
								? [
										"يُعد هذا النظام منصة متكاملة لإدارة الأعمال، تم تصميمها لتوحيد وتنظيم العمليات الأساسية داخل المؤسسة، مثل إدارة الموارد البشرية، الفواتير، القضايا القانونية، التواصل الداخلي، التقارير، والتكامل مع التطبيقات الخارجية. يتميز النظام بكونه تطبيقاً موحداً يجمع جميع الوظائف الإدارية في مكان واحد، مما يلغي الحاجة لاستخدام أنظمة متعددة منفصلة.",
										"يوفّر النظام بيئة عمل موحّدة تساعد الفرق على إدارة بيانات الموظفين، الرواتب، الحضور والانصراف، الفواتير، والقضايا القانونية بكفاءة عالية. كما تتيح لوحات التحكم والتقارير المتقدمة رؤية فورية وشاملة لأداء العمليات ومؤشرات الأعمال الرئيسية، مما يدعم اتخاذ قرارات دقيقة مبنية على البيانات. يعمل النظام كحل متكامل حيث تتصل جميع الوحدات ببعضها البعض، مما يسمح بتبادل البيانات تلقائياً بين أقسام الموارد البشرية، المحاسبة، الشؤون القانونية، والتواصل الداخلي.",
										"في إدارة الموارد البشرية، يتيح النظام إدارة شاملة لبيانات الموظفين، العقود، الرواتب، الحضور والانصراف، والطلبات. أما في إدارة الفواتير، فيمكن للمستخدمين إنشاء الفواتير، تتبع المدفوعات، وإدارة العملاء والوكلاء. بالنسبة لإدارة القضايا القانونية، يوفر النظام أداة متكاملة لتتبع القضايا، الوثائق، والأحداث المرتبطة بها. كما يضم النظام نظام تواصل داخلي متقدم يسمح للموظفين بالتواصل الفوري، مشاركة الملفات، وإدارة المحادثات الجماعية.",
										"يدعم النظام التكامل السلس مع تطبيقات وخدمات خارجية مثل أنظمة المحاسبة والبريد الإلكتروني، مما يضمن تدفق البيانات بسهولة ويقلل من التكرار اليدوي. يتم التكامل بشكل تلقائي، حيث يتم مزامنة البيانات بين النظام والتطبيقات الخارجية في الوقت الفعلي، مما يضمن دقة المعلومات وتحديثها المستمر. وبفضل تصميمه المرن والقابل للتوسّع، يناسب النظام الشركات والمؤسسات بمختلف أحجامها وقطاعاتها، حيث يمكن تخصيصه وفقاً لاحتياجات كل مؤسسة.",
									]
								: [
										"This system is an integrated business management platform designed to streamline and centralize core organizational operations, including Human Resources, Invoicing, Legal Case Management, Communication, Reporting, and Application Integrations. The system stands out as a unified application that consolidates all administrative functions in one place, eliminating the need for multiple separate systems.",
										"The platform provides a unified environment where teams can manage employee data, payroll, attendance, invoices, legal cases, and internal communication efficiently. With built-in dashboards and advanced reporting tools, decision-makers gain real-time visibility into operational performance and key business metrics. The system operates as an integrated solution where all modules are interconnected, allowing automatic data exchange between Human Resources, Accounting, Legal Affairs, and Internal Communication departments.",
										"In Human Resources management, the system enables comprehensive management of employee data, contracts, payroll, attendance, and requests. For invoicing management, users can create invoices, track payments, and manage customers and agents. Regarding legal case management, the system provides an integrated tool to track cases, documents, and associated events. The system also includes an advanced internal communication system that allows employees to communicate instantly, share files, and manage group conversations.",
										"The system also supports seamless integration with third-party applications such as accounting systems and email services, ensuring smooth data flow and eliminating manual duplication. Integration occurs automatically, with data synchronized between the system and external applications in real-time, ensuring information accuracy and continuous updates. Its modular and scalable design makes it suitable for organizations of different sizes and industries, as it can be customized according to each organization's specific needs.",
									],
			},
		},
		{
			id: "member-guide",
			label: language === "ar" ? "الأشخاص والوصول" : "People and Access",
			icon: FileText,
			content: {
						title:
							language === "ar"
								? "دليل إدارة الأدوار والصلاحيات"
								: "Roles, Job Titles & Teams Guide",
						text:
							language === "ar"
								? [
										"يقدم هذا الدليل شرحاً مفصلاً لكيفية إدارة الأدوار، المسميات الوظيفية، والفرق في النظام. اتبع الخطوات أدناه مع الصور التوضيحية.",
										"",
										"ملاحظات عامة وأفضل الممارسات:",
										"• اتبع دائماً مبدأ أقل امتياز عند تعيين الصلاحيات.",
										"• استخدم الأدوار للتحكم في الوصول، المسميات الوظيفية للهيكل، والفرق للنطاق.",
										"• راجع الأدوار والصلاحيات بشكل دوري للحفاظ على أمان النظام.",
										"• تجنب تعيين الصلاحيات الإدارية للأدوار غير الإدارية.",
										"• التغييرات على الأدوار، المسميات الوظيفية، أو الفرق قد تؤثر على وصول المستخدمين فوراً.",
									]
								: [
										"This guide provides detailed step-by-step instructions on how to manage roles, job titles, and teams in the system. Follow the steps below with the accompanying images.",
										"",
										"General Notices & Best Practices:",
										"• Always follow the principle of least privilege when assigning permissions.",
										"• Use roles for access control, job titles for structure, and teams for scope.",
										"• Review roles and permissions periodically to maintain system security.",
										"• Avoid assigning administrative permissions to non-admin roles.",
										"• Changes to roles, job titles, or teams may impact user access immediately.",
									],
						images: [
							{
								src: "https://i.postimg.cc/6pkpCTsB/Whats-App-Image-2026-01-01-at-8-41-05-PM.jpg",
								alt: language === "ar" ? "إضافة دور جديد" : "Add New Role",
								caption: language === "ar" ? "نافذة إضافة دور جديد" : "Add New Role window",
								stepTitle: language === "ar" ? "إضافة دور جديد" : "Add New Role",
								stepContent:
									language === "ar"
										? [
												"انقر على 'إضافة دور جديد' لبدء إنشاء دور جديد.",
												"سيتم فتح معالج متعدد الخطوات لإرشادك خلال تعريف تفاصيل الدور، الصلاحيات، والتأكيد.",
											]
										: [
												"Click 'Add New Role' to start creating a new role.",
												"This will open a multi-step wizard to guide you through defining role details, permissions, and confirmation.",
											],
								notices:
									language === "ar"
										? [
												"يمكن فقط للمستخدمين الذين لديهم صلاحيات إدارية إنشاء أو تعديل الأدوار.",
												"التغييرات على الأدوار تؤثر على جميع المستخدمين المعينين فوراً بعد الحفظ.",
											]
										: [
												"Only users with administrative access can create or edit roles.",
												"Changes to roles affect all assigned users immediately after saving.",
											],
							},
							{
								src: "https://i.postimg.cc/nhyhqM88/Whats-App-Image-2026-01-01-at-8-41-35-PM.jpg",
								alt: language === "ar" ? "معلومات الدور" : "Role Information",
								caption: language === "ar" ? "خطوة معلومات الدور" : "Role Information step",
								stepTitle: language === "ar" ? "الخطوة 1: معلومات الدور" : "Step 1: Role Information",
								stepContent:
									language === "ar"
										? [
												"في هذه الخطوة، تقوم بتعريف المعلومات الأساسية للدور.",
												"الحقول المطلوبة:",
												"• اسم الدور: أدخل اسماً واضحاً ووصفياً للدور (مثل: مدير الموارد البشرية، مسؤول المحاسبة).",
												"• وصف الدور: قدم شرحاً موجزاً لمسؤوليات الدور والغرض منه.",
												"• تعيين للمسمى الوظيفي (اختياري): اربط واحداً أو أكثر من المسميات الوظيفية بهذا الدور.",
											]
										: [
												"In this step, you define the basic information for the role.",
												"Fields:",
												"• Role Name: Enter a clear and descriptive name for the role (e.g., HR Manager, Accounting Admin).",
												"• Role Description: Provide a short explanation of the role's responsibilities and purpose.",
												"• Assign to Job Title (Optional): Link one or more job titles to this role. Users with these job titles can automatically inherit the role.",
											],
								notices:
									language === "ar"
										? [
												"يجب أن تكون أسماء الأدوار فريدة وسهلة التعرف عليها.",
												"الوصف الواضح يساعد المسؤولين على فهم نية الدور.",
												"تعيين المسميات الوظيفية اختياري ولكنه موصى به لإدارة أفضل للأدوار.",
											]
										: [
												"Role names should be unique and easy to identify.",
												"A clear description helps administrators understand the role's intent.",
												"Assigning job titles is optional but recommended for better role management.",
											],
							},
							{
								src: "https://i.postimg.cc/wjCjD3Kz/Whats-App-Image-2026-01-01-at-8-41-35-PM-(1).jpg",
								alt: language === "ar" ? "الصلاحيات" : "Permissions",
								caption: language === "ar" ? "خطوة الصلاحيات" : "Permissions step",
								stepTitle: language === "ar" ? "الخطوة 2: الصلاحيات" : "Step 2: Permissions",
								stepContent:
									language === "ar"
										? [
												"تسمح لك هذه الخطوة بتكوين ما يمكن للدور الوصول إليه وإدارته عبر النظام.",
												"الصلاحيات مجمعة حسب وحدات النظام (مثل: الأصول، الحضور، الموارد البشرية).",
												"كل صلاحية تمثل إجراءً مثل: القراءة، الإنشاء، التحديث، الحذف، الإدارة، الموافقة.",
												"بعض الصلاحيات تتضمن محدد النطاق الذي يحدد مستوى الوصول: الافتراضي، الكل، فريقي، فريق محدد، أو ما يديره المستخدم.",
											]
										: [
												"This step allows you to configure what the role can access and manage across the system.",
												"Permissions are grouped by system modules (e.g., Assets, Attendance, HR).",
												"Each permission represents an action, such as: Read, Create, Update, Delete, Manage, Approve.",
												"Some permissions include a scope selector that defines the access level: Default, All, My Team, Specific Team, or Managed by Me.",
											],
								notices:
									language === "ar"
										? [
												"الصلاحيات المميزة كـ 'مطلوبة' إلزامية ولا يمكن تعطيلها.",
												"امنح صلاحية 'الكل' فقط للأدوار الإدارية الموثوقة.",
												"الصلاحيات المطلوبة تضمن وظائف النظام الأساسية ولا يمكن إزالتها.",
												"الصلاحيات المكونة بشكل خاطئ قد تمنع المستخدمين من إكمال المهام الأساسية.",
											]
										: [
												"Permissions marked as Required are mandatory and cannot be disabled.",
												"Grant All access only to trusted administrative roles.",
												"Required permissions ensure core system functionality and cannot be removed.",
												"Misconfigured permissions may restrict users from completing essential tasks.",
											],
							},
							{
								src: "https://i.postimg.cc/MpCp1Xkq/Whats-App-Image-2026-01-01-at-8-41-51-PM.jpg",
								alt: language === "ar" ? "المراجعة والتأكيد" : "Review & Confirm",
								caption: language === "ar" ? "خطوة المراجعة" : "Review step",
								stepTitle: language === "ar" ? "الخطوة 3: المراجعة والتأكيد" : "Step 3: Review & Confirm",
								stepContent:
									language === "ar"
										? [
												"في هذه الخطوة، تراجع جميع تفاصيل الدور والصلاحيات قبل الحفظ.",
												"يمكنك التحقق من:",
												"• اسم الدور والوصف",
												"• المسميات الوظيفية المعينة",
												"• الصلاحيات المحددة والنطاقات",
												"انقر على 'تأكيد' لإنشاء الدور.",
											]
										: [
												"In this step, you review all role details and permissions before saving.",
												"You can verify:",
												"• Role name and description",
												"• Assigned job titles",
												"• Selected permissions and scopes",
												"Click 'Confirm' to create the role.",
											],
								notices:
									language === "ar"
										? [
												"راجع الصلاحيات بعناية قبل التأكيد.",
												"بمجرد الإنشاء، يمكن تعديل الدور لاحقاً إذا كانت هناك حاجة للتعديلات.",
											]
										: [
												"Review permissions carefully before confirming.",
												"Once created, the role can be edited later if adjustments are needed.",
											],
							},
							{
								src: "https://i.postimg.cc/hGVPsggq/Whats-App-Image-2026-01-01-at-8-42-03-PM.jpg",
								alt: language === "ar" ? "إضافة مسمى وظيفي" : "Add Job Title",
								caption: language === "ar" ? "نافذة إضافة مسمى وظيفي" : "Add Job Title window",
								stepTitle: language === "ar" ? "إضافة مسمى وظيفي" : "Add Job Title",
								stepContent:
									language === "ar"
										? [
												"المسميات الوظيفية تحدد المناصب الرسمية داخل المؤسسة وتساعد في توحيد تعيينات الأدوار.",
												"الحقول المطلوبة:",
												"• اسم المسمى الوظيفي: أدخل الاسم الرسمي للمسمى الوظيفي (مثل: مهندس برمجيات، أخصائي موارد بشرية).",
												"• الوصف: صف المسؤوليات أو نطاق المسمى الوظيفي.",
												"• تعيين الأدوار: اختر واحداً أو أكثر من الأدوار التي يجب ربطها بهذا المسمى الوظيفي.",
											]
										: [
												"Job titles define official positions within the organization and help standardize role assignments.",
												"Fields:",
												"• Job Title Name: Enter the official name of the job title (e.g., Software Engineer, HR Specialist).",
												"• Description: Describe the responsibilities or scope of the job title.",
												"• Assign Roles: Select one or more roles that should be linked to this job title.",
											],
								notices:
									language === "ar"
										? [
												"المسميات الوظيفية تساعد في أتمتة تعيين الأدوار.",
												"تعيين الأدوار للمسميات الوظيفية يقلل من أخطاء التكوين اليدوي.",
												"يمكن إعادة استخدام المسميات الوظيفية عبر الفرق.",
												"تأكد من أن المسمى الوظيفي يعكس المسؤوليات بدقة قبل الحفظ.",
											]
										: [
												"Job titles help automate role assignment.",
												"Assigning roles to job titles reduces manual configuration errors.",
												"Job titles can be reused across teams.",
												"Ensure the job title accurately reflects responsibilities before saving.",
											],
							},
							{
								src: "https://i.postimg.cc/s25Dmyyz/Whats-App-Image-2026-01-01-at-8-42-10-PM.jpg",
								alt: language === "ar" ? "إضافة فريق" : "Add Team",
								caption: language === "ar" ? "نافذة إضافة فريق" : "Add Team window",
								stepTitle: language === "ar" ? "إضافة فريق" : "Add Team",
								stepContent:
									language === "ar"
										? [
												"الفرق تستخدم لتنظيم المستخدمين في أقسام أو مجموعات وظيفية والتحكم في نطاقات الصلاحيات مثل الوصول 'لفريقي'.",
												"الحقول المطلوبة:",
												"• اسم الفريق: أدخل اسماً واضحاً للفريق (مثل: فريق التسويق، قسم المالية).",
												"• وصف الفريق: صف الغرض من الفريق ومسؤولياته.",
												"• تعيين المسميات الوظيفية (اختياري): اربط المسميات الوظيفية بالفريق لتحسين الهيكل التنظيمي.",
											]
										: [
												"Teams are used to organize users into departments or functional groups and control permission scopes such as 'My Team' access.",
												"Fields:",
												"• Team Name: Enter a clear name for the team (e.g., Marketing Team, Finance Department).",
												"• Team Description: Describe the team's purpose and responsibilities.",
												"• Assign Job Titles (Optional): Link job titles to the team for better organizational structure.",
											],
								notices:
									language === "ar"
										? [
												"الفرق تساعد في التحكم في رؤية الوصول والتقارير.",
												"نطاقات الصلاحيات مثل 'فريقي' تعتمد على تعيينات الفرق.",
												"يمكن للمستخدم أن ينتمي إلى فريق واحد أو أكثر حسب التكوين.",
												"تأكد من أن هيكل الفريق يطابق التسلسل الهرمي للمؤسسة.",
												"يمكن تعديل الفرق لاحقاً إذا تغيرت المؤسسة.",
											]
										: [
												"Teams help control access visibility and reporting.",
												"Permission scopes like 'My Team' depend on team assignments.",
												"A user can belong to one or more teams depending on configuration.",
												"Ensure team structure matches your organizational hierarchy.",
												"Teams can be edited later if the organization changes.",
											],
							},
						],
			},
		},
		{
			id: "add-member",
			label: language === "ar" ? "إضافة عضو" : "Add Member",
			icon: FileText,
			content: {
						title:
							language === "ar"
								? "دليل إضافة عضو جديد"
								: "Add New Member Guide",
						text:
							language === "ar"
								? [
										"يسمح لك نظام إدارة الأعضاء بإدارة مستخدمي النظام، تعيين الأدوار، تتبع الحالة، والتحكم في الوصول عبر المنصة.",
										"من هذه الصفحة، يمكن للمسؤولين: عرض جميع الأعضاء، مراقبة حالة الأعضاء، إضافة أعضاء جدد، دعوة المستخدمين إلى النظام، تعيين الأدوار والمسميات الوظيفية والفرق.",
									]
								: [
										"The Members module allows administrators to manage system users, assign roles, track status, and control access across the platform.",
										"From this page, administrators can: View all members, Monitor member status, Add new members, Invite users to the system, Assign roles, job titles, and teams.",
									],
						images: [
							{
								src: "https://i.postimg.cc/nrwYVqXt/Whats-App-Image-2026-01-01-at-8-58-00-PM.jpg",
								alt: language === "ar" ? "صفحة الأعضاء" : "Members Page",
								caption: language === "ar" ? "نظرة عامة على صفحة الأعضاء" : "Members Overview Page",
								stepTitle: language === "ar" ? "صفحة نظرة عامة على الأعضاء" : "Members Overview Page",
								stepContent:
									language === "ar"
										? [
												"توفر صفحة الأعضاء نظرة شاملة على جميع المستخدمين في النظام.",
												"بطاقات الملخص: في أعلى الصفحة، يتم عرض إحصائيات رئيسية: إجمالي الأعضاء، إجمالي الفرق، الأعضاء النشطون، الأعضاء غير النشطين، الصلاحيات المتجاوزة.",
												"جدول الأعضاء: يعرض كل سجل عضو: الاسم والبريد الإلكتروني، المسمى الوظيفي، رقم الاتصال، تاريخ الانضمام، وضع الصلاحية (افتراضي / تجاوز)، الحالة (نشط، غير نشط، مدعو)، الدور المعين.",
											]
										: [
												"The Members page provides a complete overview of all users in the system.",
												"Summary Cards: At the top of the page, key statistics are displayed: Total Members, Total Teams, Active Members, Inactive Members, Overridden Permissions.",
												"Members Table: Each member record displays: Name and email, Job title, Contact number, Join date, Permission mode (Default / Override), Status (Active, Inactive, Invited), Assigned role.",
											],
								notices:
									language === "ar"
										? [
												"الأعضاء الذين لديهم صلاحيات متجاوزة لديهم وصول مخصص مختلف عن دورهم.",
												"تحديثات الحالة سارية المفعول فوراً.",
												"يمكن فقط للمستخدمين المصرح لهم إدارة الأعضاء.",
											]
										: [
												"Members with Override permissions have custom access different from their role.",
												"Status updates take effect immediately.",
												"Only authorized users can manage members.",
											],
							},
							{
								src: "https://i.postimg.cc/VvNWcKkN/Whats-App-Image-2026-01-01-at-9-00-01-PM-(1).jpg",
								alt: language === "ar" ? "إضافة عضو - الخطوة 1" : "Add Member - Step 1",
								caption: language === "ar" ? "المعلومات الأساسية" : "Basic Information",
								stepTitle: language === "ar" ? "الخطوة 1: المعلومات الأساسية" : "Step 1: Basic Information",
								stepContent:
									language === "ar"
										? [
												"تجمع هذه الخطوة التفاصيل الشخصية الأساسية المطلوبة لإنشاء ملف العضو.",
												"الحقول:",
												"• صورة الملف الشخصي (اختياري): ارفع صورة ملف شخصي (الحد الأدنى 400×400 بكسل، PNG أو JPEG).",
												"• الاسم الأول واسم العائلة: أدخل الاسم القانوني للعضو.",
												"• عنوان البريد الإلكتروني: يُستخدم لتسجيل الدخول وإشعارات النظام.",
												"• رقم الهاتف: اختر رمز الدولة وأدخل رقماً صالحاً.",
												"• الدولة: اختر جنسية العضو.",
												"• تاريخ الميلاد: يُستخدم لسجلات الموارد البشرية والامتثال.",
												"التفاصيل الشخصية (اختياري): الجنس، الحالة الاجتماعية، رقم الهوية الوطنية / جواز السفر، العنوان، إرفاق المستندات الشخصية.",
											]
										: [
												"This step collects core personal details required to create the member profile.",
												"Fields:",
												"• Profile Image (Optional): Upload a profile image (minimum 400×400 px, PNG or JPEG).",
												"• First Name & Last Name: Enter the member's legal name.",
												"• Email Address: Used for login and system notifications.",
												"• Phone Number: Select country code and enter a valid number.",
												"• Country: Select the member's nationality.",
												"• Date of Birth: Used for HR records and compliance.",
												"Personal Details (Optional): Gender, Marital Status, National ID / Passport Number, Address, Attach personal documents.",
											],
								notices:
									language === "ar"
										? [
												"يجب أن يكون عنوان البريد الإلكتروني فريداً.",
												"يجب أن تكون المستندات المرفوعة صالحة ومحدثة.",
												"يتم تخزين البيانات الشخصية بأمان وتُستخدم فقط لامتثال الموارد البشرية.",
											]
										: [
												"Email address must be unique.",
												"Uploaded documents should be valid and up to date.",
												"Personal data is stored securely and used for HR compliance only.",
											],
							},
							{
								src: "https://i.postimg.cc/Xqvk0sYJ/Whats-App-Image-2026-01-01-at-9-00-01-PM-(2).jpg",
								alt: language === "ar" ? "إضافة عضو - الخطوة 2" : "Add Member - Step 2",
								caption: language === "ar" ? "معلومات العمل" : "Work Information",
								stepTitle: language === "ar" ? "الخطوة 2: معلومات العمل" : "Step 2: Work Information",
								stepContent:
									language === "ar"
										? [
												"تحدد هذه الخطوة دور العضو داخل المؤسسة.",
												"الحقول:",
												"• المسمى الوظيفي: اختر المسمى الوظيفي للعضو.",
												"• الفريق: عيّن العضو إلى فريق.",
												"• الدور: يحدد صلاحيات النظام ومستوى الوصول.",
												"• المدير: اختر المدير المسؤول.",
												"• نوبة العمل (اختياري): عيّن نوبة محددة مسبقاً إن أمكن.",
												"• نوع التوظيف: (مثل: دوام كامل، دوام جزئي، عقد).",
												"• تاريخ البدء: تاريخ البدء الرسمي للموظف.",
												"• جدول العمل / ساعات في الأسبوع: يُستخدم للحضور والرواتب.",
												"• فترة التجربة (اختياري): المدة بالأيام.",
												"• معرف العضو: يتم إنشاؤه تلقائياً وهو فريد.",
											]
										: [
												"This step defines the member's role within the organization.",
												"Fields:",
												"• Job Title: Select the member's job title.",
												"• Team: Assign the member to a team.",
												"• Role: Defines system permissions and access level.",
												"• Manager: Select the reporting manager.",
												"• Work Shift (Optional): Assign a predefined shift if applicable.",
												"• Employment Type: (e.g., Full-time, Part-time, Contract).",
												"• Start Date: Employee's official start date.",
												"• Work Schedule / Hours per Week: Used for attendance and payroll.",
												"• Probation Period (Optional): Duration in days.",
												"• Member ID: Automatically generated and unique.",
											],
								notices:
									language === "ar"
										? [
												"اختيار الدور يؤثر مباشرة على وصول النظام.",
												"تأكد من تعيين المدير بشكل صحيح لسير عمل الموافقة.",
												"المسمى الوظيفي والفريق يساعدان في تحديد نطاقات الصلاحيات.",
											]
										: [
												"Role selection directly affects system access.",
												"Ensure the manager is correctly assigned for approval workflows.",
												"Job title and team help determine permission scopes.",
											],
							},
							{
								src: "https://i.postimg.cc/brFHY1ZP/Whats-App-Image-2026-01-01-at-9-00-01-PM-(3).jpg",
								alt: language === "ar" ? "إضافة عضو - الخطوة 3" : "Add Member - Step 3",
								caption: language === "ar" ? "تفاصيل الإقامة" : "Residency Details",
								stepTitle: language === "ar" ? "الخطوة 3: تفاصيل الإقامة" : "Step 3: Residency Details",
								stepContent:
									language === "ar"
										? [
												"تُستخدم هذه الخطوة للامتثال للفيزا والإقامة والقانونية.",
												"الحقول:",
												"• حالة الإقامة: اختر حالة الإقامة الحالية.",
												"• دولة الإقامة: حيث يقيم العضو قانونياً.",
												"• نوع الإقامة / الفيزا: (مثل: فيزا عمل، تصريح إقامة).",
												"• رقم الإقامة / الفيزا: رقم المستند الرسمي.",
												"• تاريخ الإصدار وتاريخ الانتهاء: يُستخدم لتتبع الامتثال والتنبيهات.",
												"• رفع المستند: ارفع بطاقة الهوية الإماراتية أو مستندات الإقامة.",
											]
										: [
												"This step is used for visa, residency, and legal compliance.",
												"Fields:",
												"• Residency Status: Select the current residency status.",
												"• Country of Residency: Where the member legally resides.",
												"• Residency / Visa Type: (e.g., Employment Visa, Residence Permit).",
												"• Residency / Visa Number: Official document number.",
												"• Issue Date & Expiry Date: Used for compliance tracking and alerts.",
												"• Document Upload: Upload Emirates ID or residency documents.",
											],
								notices:
									language === "ar"
										? [
												"تواريخ الانتهاء تُستخدم للتذكيرات وتنبيهات الامتثال.",
												"يجب أن تكون المستندات المرفوعة واضحة وقابلة للقراءة.",
												"احتفظ ببيانات الإقامة محدثة لتجنب مشاكل الامتثال.",
											]
										: [
												"Expiry dates are used for reminders and compliance alerts.",
												"Uploaded documents must be clear and readable.",
												"Keep residency data up to date to avoid compliance issues.",
											],
							},
							{
								src: "https://i.postimg.cc/QCnkNcFC/Whats-App-Image-2026-01-01-at-9-00-36-PM.jpg",
								alt: language === "ar" ? "دعوة العضو" : "Member Invitation",
								caption: language === "ar" ? "بريد الدعوة" : "Invitation Email",
								stepTitle: language === "ar" ? "الدعوة وتفعيل الحساب" : "Invitation & Account Activation",
								stepContent:
									language === "ar"
										? [
												"بعد إضافة عضو، يرسل النظام بريد دعوة تلقائياً يحتوي على:",
												"• معرف الموظف",
												"• رمز التحقق",
												"• رابط التسجيل الآمن",
												"يجب على المستخدم إكمال إعداد الحساب للوصول إلى النظام.",
											]
										: [
												"After adding a member, the system sends an invitation email containing:",
												"• Employee ID",
												"• Verification code",
												"• Secure signup link",
												"The user must complete account setup to access the system.",
											],
								notices:
									language === "ar"
										? [
												"روابط الدعوة حساسة للوقت.",
												"إذا لم يتم استلام البريد الإلكتروني، تحقق من البريد العشوائي أو أعد إرسال الدعوة.",
											]
										: [
												"Invitation links are time-sensitive.",
												"If the email is not received, check spam or resend the invitation.",
											],
							},
							{
								src: "https://i.postimg.cc/QCnkNcFH/Whats-App-Image-2026-01-01-at-9-01-14-PM.jpg",
								alt: language === "ar" ? "إكمال التسجيل" : "Complete Signup",
								caption: language === "ar" ? "إعداد كلمة المرور" : "Password Setup",
								stepTitle: language === "ar" ? "إكمال التسجيل وإعداد كلمة المرور" : "Complete Signup & Password Setup",
								stepContent:
									language === "ar"
										? [
												"ينقر المستخدم المدعو على 'إكمال التسجيل' لتعيين كلمة مرور.",
												"متطلبات كلمة المرور: يجب أن تتضمن كلمة المرور:",
												"• 8 أحرف على الأقل",
												"• حرف كبير واحد",
												"• حرف صغير واحد",
												"• رقم واحد",
												"• حرف خاص واحد",
												"بعد تعيين كلمة المرور، يصبح الحساب نشطاً.",
											]
										: [
												"The invited user clicks 'Complete Signup' to set a password.",
												"Password Requirements: The password must include:",
												"• At least 8 characters",
												"• One uppercase letter",
												"• One lowercase letter",
												"• One number",
												"• One special character",
												"After setting the password, the account becomes active.",
											],
								notices:
									language === "ar"
										? [
												"يجب أن تلبي كلمات المرور متطلبات الأمان.",
												"يجب على المستخدمين الحفاظ على بيانات الاعتماد سرية.",
												"إذا انتهت صلاحية الرابط، يجب إرسال دعوة جديدة.",
											]
										: [
												"Passwords must meet security requirements.",
												"Users should keep credentials confidential.",
												"If the link expires, a new invitation must be sent.",
											],
							},
							{
								src: "https://i.postimg.cc/GtjR1bzk/Whats_App_Image_2026_01_01_at_9_29_15_PM.jpg",
								alt: language === "ar" ? "صفحة العقود" : "Contracts Page",
								caption: language === "ar" ? "نظرة عامة على صفحة العقود" : "Contracts Overview Page",
								stepTitle: language === "ar" ? "صفحة العقود" : "Contracts Page",
								stepContent:
									language === "ar"
										? [
												"توفر صفحة العقود نظرة شاملة على جميع عقود التوظيف في النظام.",
												"بطاقات الملخص: في أعلى الصفحة، يتم عرض إحصائيات رئيسية: العقد النشط، العقد قريب الانتهاء، مسودة العقد، العقد المنتهي، العقد المنهي.",
												"جدول العقود: يعرض كل سجل عقد: رقم المعرف، اسم العقد، المعين إلى، الحالة، مدة العقد، مبلغ العقد، الإجراءات.",
												"يمكن البحث عن العقود بالاسم أو اسم العضو، والتصفية والفرز حسب الحاجة.",
												"زر 'إنشاء عقد' يفتح معالج إنشاء العقد متعدد الخطوات.",
											]
										: [
												"The Contracts page provides a complete overview of all employment contracts in the system.",
												"Summary Cards: At the top of the page, key statistics are displayed: Active Contract, Contract Near Expire, Draft Contract, Expired Contract, Terminated Contract.",
												"Contracts Table: Each contract record displays: ID number, Contract Name, Assigned To, Status, Contract Duration, Contract Amount, Actions.",
												"You can search contracts by name or member name, and filter and sort as needed.",
												"The 'Create Contract' button opens a multi-step contract creation wizard.",
											],
								notices:
									language === "ar"
										? [
												"يمكن عرض تفاصيل العقد من خلال النقر على السجل.",
											]
										: [
												"Contract details can be viewed by clicking on the record.",
											],
							},
							{
								src: "https://i.postimg.cc/4y1GTXw3/Whats_App_Image_2026_01_01_at_9_30_14_PM_(1).jpg",
								alt: language === "ar" ? "إنشاء عقد - الخطوة 1" : "Create Contract - Step 1",
								caption: language === "ar" ? "التعويضات" : "Compensation",
								stepTitle: language === "ar" ? "الخطوة 1: التعويضات" : "Step 1: Compensation",
								stepContent:
									language === "ar"
										? [
												"في هذه الخطوة، تقوم بتعيين الراتب ومعدل العمل الإضافي.",
												"الحقول المطلوبة:",
												"• الراتب الأساسي: أدخل الراتب الأساسي للموظف (بالدرهم الإماراتي AED).",
												"• دورة الراتب: اختر دورة الراتب (مثل: شهري، أسبوعي، سنوي).",
												"• معدل العمل الإضافي / ساعة: أدخل معدل العمل الإضافي لكل ساعة (بالدرهم الإماراتي AED).",
											]
										: [
												"In this step, you set the salary and overtime rate.",
												"Required Fields:",
												"• Base Salary: Enter the employee's base salary (in AED - UAE Dirham).",
												"• Salary Cycle: Select the salary cycle (e.g., Monthly, Weekly, Annual).",
												"• Overtime rate / hour: Enter the overtime rate per hour (in AED - UAE Dirham).",
											],
								notices:
									language === "ar"
										? [
												"الراتب الأساسي يُستخدم في حسابات الرواتب.",
												"معدل العمل الإضافي يُطبق على الساعات الإضافية المعتمدة.",
												"يمكن تعديل هذه القيم لاحقاً إذا لزم الأمر.",
											]
										: [
												"Base salary is used in payroll calculations.",
												"Overtime rate applies to approved overtime hours.",
												"These values can be modified later if needed.",
											],
							},
							{
								src: "https://i.postimg.cc/HntmCT35/Whats_App_Image_2026_01_01_at_9_30_14_PM.jpg",
								alt: language === "ar" ? "إنشاء عقد - الخطوة 2" : "Create Contract - Step 2",
								caption: language === "ar" ? "تعيين العضو" : "Assign Member",
								stepTitle: language === "ar" ? "الخطوة 2: تعيين العضو" : "Step 2: Assign Member",
								stepContent:
									language === "ar"
										? [
												"في هذه الخطوة، تقوم بتعيين العضو للعقد وإدخال المعلومات الأساسية.",
												"الحقول المطلوبة:",
												"• اسم العقد: أدخل اسماً واضحاً ووصفياً للعقد.",
												"• العضو: ابحث واختر العضو الذي سيتم تعيين العقد له.",
												"• نوع العقد: اختر نوع العقد (مثل: دوام كامل، دوام جزئي، عقد مؤقت).",
												"• تاريخ البدء: حدد تاريخ بدء العقد.",
												"• تاريخ الانتهاء: حدد تاريخ انتهاء العقد.",
												"إرفاق المستندات: يمكنك رفع المستندات ذات الصلة بالعقد مثل:",
												"• صيغ مدعومة: JPEG، PNG، PDF، MP4",
												"• الحد الأقصى لحجم الملف: 50 ميجابايت",
												"• يمكنك السحب والإفلات أو النقر على 'تصفح الملف'",
											]
										: [
												"In this step, you assign the member to the contract and enter basic information.",
												"Required Fields:",
												"• Contract Name: Enter a clear and descriptive name for the contract.",
												"• Member: Search and select the member who will be assigned to this contract.",
												"• Contract Type: Select the contract type (e.g., Full-time, Part-time, Temporary).",
												"• Start Date: Set the contract start date.",
												"• End Date: Set the contract end date.",
												"Attach Documents: You can upload relevant contract documents such as:",
												"• Supported formats: JPEG, PNG, PDF, MP4",
												"• Maximum file size: 50 MB",
												"• You can drag and drop or click 'Browse File'",
											],
								notices:
									language === "ar"
										? [
												"يجب أن يكون اسم العقد فريداً وواضحاً.",
												"تأكد من اختيار العضو الصحيح قبل المتابعة.",
												"المستندات المرفوعة تُخزن بشكل آمن ويمكن الوصول إليها لاحقاً.",
											]
										: [
												"Contract name should be unique and clear.",
												"Ensure you select the correct member before proceeding.",
												"Uploaded documents are securely stored and can be accessed later.",
											],
							},
							{
								src: "https://i.postimg.cc/NFxtwQbM/Whats_App_Image_2026_01_01_at_9_30_14_PM_(2).jpg",
								alt: language === "ar" ? "إنشاء عقد - الخطوة 3" : "Create Contract - Step 3",
								caption: language === "ar" ? "السياسات والحدود" : "Policy & Limits",
								stepTitle: language === "ar" ? "الخطوة 3: السياسات والحدود" : "Step 3: Policy & Limits",
								stepContent:
									language === "ar"
										? [
												"في هذه الخطوة، تقوم بتعيين فترة الإشعار وسياسات الإجازة.",
												"الحقول المطلوبة (بالأيام):",
												"• فترة الإشعار: عدد الأيام المطلوبة للإشعار قبل إنهاء العقد.",
												"• الإجازة المرضية: عدد أيام الإجازة المرضية المسموح بها سنوياً.",
												"• الإجازة العادية: عدد أيام الإجازة العادية المسموح بها.",
												"• الإجازة السنوية: عدد أيام الإجازة السنوية المسموح بها.",
												"• حد الغياب: الحد الأقصى لعدد أيام الغياب المسموح بها قبل اتخاذ إجراء.",
											]
										: [
												"In this step, you set the notice period and leave policies.",
												"Required Fields (in Days):",
												"• Notice Period: Number of days required for notice before contract termination.",
												"• Sick Leave: Number of sick leave days allowed per year.",
												"• Casual Leave: Number of casual leave days allowed.",
												"• Annual Leave: Number of annual leave days allowed.",
												"• Absence Limit: Maximum number of absence days allowed before action is taken.",
											],
								notices:
									language === "ar"
										? [
												"هذه القيم تؤثر على حسابات الإجازة والرواتب.",
												"تأكد من أن القيم متوافقة مع سياسات الشركة.",
												"يمكن تعديل هذه القيم لاحقاً إذا لزم الأمر.",
											]
										: [
												"These values affect leave calculations and payroll.",
												"Ensure values are compliant with company policies.",
												"These values can be modified later if needed.",
											],
							},
						],
			},
		},
		{
			id: "member-profile",
			label: language === "ar" ? "ملف العضو" : "Member Profile",
			icon: FileText,
			content: {
						title:
							language === "ar"
								? "دليل ملف العضو"
								: "Member Profile Guide",
						text:
							language === "ar"
								? [
										"توفر صفحة ملف العضو عرضاً مركزياً لجميع المعلومات المتعلقة بالموظف، بما في ذلك البيانات الشخصية، العقود، الحضور، الأصول، الرواتب، وتفاصيل الإقامة.",
										"تسمح للمسؤولين والمديرين المصرح لهم بمراقبة حالة الموظف، إدارة عمليات الموارد البشرية، وضمان الامتثال.",
									]
								: [
										"The Member Profile page provides a centralized view of all employee-related information, including personal data, contracts, attendance, assets, payroll, and residency details.",
										"It allows administrators and authorized managers to monitor employee status, manage HR operations, and ensure compliance.",
									],
						images: [
							{
								src: "https://i.postimg.cc/j59yKrgH/Whats_App_Image_2026_01_01_at_9_17_39_PM.jpg",
								alt: language === "ar" ? "رأس الملف والملخص" : "Profile Header & Overview",
								caption: language === "ar" ? "نظرة عامة على ملف العضو" : "Member Profile Overview",
								stepTitle: language === "ar" ? "رأس الملف وبطاقات الملخص" : "Profile Header & Summary Cards",
								stepContent:
									language === "ar"
										? [
												"في أعلى الملف، يتم عرض المعلومات التالية:",
												"• اسم العضو والصورة الرمزية",
												"• الحالة الحالية (نشط / غير نشط)",
												"• تاريخ آخر تحديث",
												"• التنقل السريع بين الأعضاء",
												"• زر إرسال رسالة للتواصل المباشر",
												"",
												"بطاقات الملخص توفر رؤى سريعة:",
												"• أيام الغياب – المستخدمة مقابل المسموح بها",
												"• ساعات العمل الإضافي – إجمالي ساعات العمل الإضافي المعتمدة",
												"• التأخيرات – تسجيلات التأخر في الوصول",
												"• الطلبات المعلقة – طلبات الإجازة أو الحضور",
												"• حالة العقد – نشط، منتهي، أو غير متاح",
											]
										: [
												"At the top of the profile, the following information is displayed:",
												"• Member Name & Avatar",
												"• Current Status (Active / Inactive)",
												"• Last Updated Date",
												"• Quick Navigation between members",
												"• Send Message button for direct communication",
												"",
												"Summary Cards provide quick insights:",
												"• Absence Days – Used vs allowed",
												"• Overtime – Total approved overtime hours",
												"• Late Arrivals – Recorded late check-ins",
												"• Pending Requests – Leave or attendance requests",
												"• Contract Status – Active, Terminated, or Not Available",
											],
								notices:
									language === "ar"
										? [
												"تحدّث بيانات الملخص تلقائياً بناءً على نشاط النظام.",
												"تظهر مقاييس العقد فقط إذا كان العقد موجوداً.",
											]
										: [
												"Summary data updates automatically based on system activity.",
												"Contract-related metrics appear only if a contract exists.",
											],
							},
							{
								src: "https://i.postimg.cc/MTX1hGDq/Whats_App_Image_2026_01_01_at_9_17_39_PM_(1).jpg",
								alt: language === "ar" ? "معلومات الملف الشخصي" : "Profile Information",
								caption: language === "ar" ? "تبويب معلومات الملف الشخصي" : "Profile Information Tab",
								stepTitle: language === "ar" ? "معلومات الملف الشخصي" : "Profile Information Tab",
								stepContent:
									language === "ar"
										? [
												"يعرض هذا التبويب المعلومات الشخصية والمتعلقة بالتوظيف للموظف.",
												"التفاصيل الشخصية تشمل: الاسم الكامل، الجنس، تاريخ الميلاد، العمر، الجنسية، الحالة الاجتماعية، البلد / المدينة.",
												"معلومات العمل تشمل: المسمى الوظيفي، الفريق، المدير، الدور، وضع الصلاحية (افتراضي / تجاوز)، معرف العضو، تاريخ البدء، تاريخ الانتهاء (إن وجد).",
												"التعويضات والتوظيف تشمل: الراتب، دورة الراتب، نوع العقد، فترة التجربة، معدل العمل الإضافي (إن وجد).",
												"معلومات العنوان تشمل: عنوان الشارع، البلد.",
												"معلومات الاتصال تشمل: عنوان البريد الإلكتروني، رقم الهاتف.",
											]
										: [
												"This tab displays the employee's personal and employment-related information.",
												"Personal Details include: Full name, Gender, Date of birth, Age, Nationality, Marital status, Country / City.",
												"Work Information includes: Job title, Team, Manager, Role, Permission mode (Default / Override), Member ID, Start date, End date (if applicable).",
												"Compensation & Employment includes: Salary, Salary cycle, Contract type, Probation period, Overtime rate (if applicable).",
												"Address Information includes: Street address, Country.",
												"Contact Information includes: Email address, Phone number.",
											],
								notices:
									language === "ar"
										? [
												"يمكن تحديث الحقول المميزة بـ 'غير متاح' لاحقاً.",
												"يعكس وضع الصلاحية ما إذا كان العضو يتبع صلاحيات الدور أو تجاوزات مخصصة.",
											]
										: [
												"Fields marked 'Not Provided' can be updated later.",
												"Permission mode reflects whether the member follows role permissions or custom overrides.",
											],
							},
							{
								src: "https://i.postimg.cc/263nP5w5/Whats_App_Image_2026_01_01_at_9_17_39_PM_(2).jpg",
								alt: language === "ar" ? "تبويب العقد" : "Contract Tab",
								caption: language === "ar" ? "تفاصيل العقد" : "Contract Details",
								stepTitle: language === "ar" ? "تبويب العقد" : "Contract Tab",
								stepContent:
									language === "ar"
										? [
												"يحتوي هذا التبويب على جميع تفاصيل عقد التوظيف.",
												"مدة العقد تعرض: تاريخ البدء، تاريخ الانتهاء، مؤشر التقدم المرئي، حالة العقد (نشط / منتهي).",
												"زر 'تمديد المدة' يسمح بتجديد العقد عند الاقتضاء.",
												"بنود العقد تشمل: فترة الإشعار، بدل الإجازة المرضية، الإجازة العادية، الإجازة السنوية، حدود الغياب، قواعد الإنهاء التلقائي.",
												"مستندات العقد تخزن الملفات المرفوعة للعقد للمرجعية والامتثال.",
											]
										: [
												"This tab contains all employment contract details.",
												"Contract Duration displays: Start date, End date, Visual progress indicator, Contract status (Active / Terminated).",
												"An Extend Duration button allows contract renewal when applicable.",
												"Contract Clauses include: Notice period, Sick leave allowance, Casual leave, Annual leave, Absence limits, Auto-termination rules.",
												"Contract Documents stores uploaded contract files for reference and compliance.",
											],
								notices:
									language === "ar"
										? [
												"العقد المنتهي يعطل معالجة الحضور والرواتب.",
												"قواعد العقد تؤثر على حسابات الإجازة وخصومات الرواتب.",
											]
										: [
												"A terminated contract disables attendance and payroll processing.",
												"Contract rules affect leave calculations and payroll deductions.",
											],
							},
							{
								src: "https://i.postimg.cc/zB3T9fjG/Whats_App_Image_2026_01_01_at_9_17_39_PM_(3).jpg",
								alt: language === "ar" ? "تبويب إدارة الوقت" : "Time Management Tab",
								caption: language === "ar" ? "الحضور وإدارة الوقت" : "Attendance & Time Management",
								stepTitle: language === "ar" ? "تبويب إدارة الوقت" : "Time Management Tab",
								stepContent:
									language === "ar"
										? [
												"يتتبع هذا التبويب الحضور، الإجازات، والعمل الإضافي.",
												"عرض الحضور يعرض: أوقات تسجيل الدخول والخروج اليومية، إجمالي مدة العمل، الجدول الزمني المرئي لساعات العمل.",
												"الإجازات تعرض سجلات الإجازة المعتمدة والمعلقة.",
												"العمل الإضافي يعرض ساعات العمل الإضافي مع حالة الموافقة.",
											]
										: [
												"This tab tracks attendance, time off, and overtime.",
												"Attendance View shows: Daily clock-in and clock-out times, Total working duration, Visual timeline of working hours.",
												"Time Off displays approved and pending leave records.",
												"Overtime shows overtime hours with approval status.",
											],
								notices:
									language === "ar"
										? [
												"تُستخدم بيانات الحضور في حسابات الرواتب.",
												"يجب الموافقة على العمل الإضافي ليتم تضمينه في الرواتب.",
												"التأخيرات تؤثر على تقارير الحضور.",
											]
										: [
												"Attendance data is used in payroll calculations.",
												"Overtime must be approved to be included in payroll.",
												"Late arrivals affect attendance reports.",
											],
							},
							{
								src: "https://i.postimg.cc/mrk06Q0Z/Screenshot-2026-01-01-212622.png",
								alt: language === "ar" ? "تبويب المستندات" : "Documents Tab",
								caption: language === "ar" ? "مستندات الموظف" : "Employee Documents",
								stepTitle: language === "ar" ? "تبويب المستندات" : "Documents Tab",
								stepContent:
									language === "ar"
										? [
												"يخزن هذا التبويب المستندات المتعلقة بالموظف مثل:",
												"• مستندات الهوية",
												"• العقود",
												"• الشهادات",
												"• نماذج الموارد البشرية",
											]
										: [
												"This tab stores employee-related documents such as:",
												"• Identification documents",
												"• Contracts",
												"• Certificates",
												"• HR forms",
											],
								notices:
									language === "ar"
										? [
												"يتم تخزين المستندات بشكل آمن.",
												"يعتمد الوصول على صلاحيات المستخدم.",
												"احتفظ بالمستندات محدثة لأغراض الامتثال.",
											]
										: [
												"Documents are securely stored.",
												"Access depends on user permissions.",
												"Keep documents updated for compliance purposes.",
											],
							},
							{
								src: "https://i.postimg.cc/XJX9Tv8Z/Whats_App_Image_2026_01_01_at_9_17_39_PM_(4).jpg",
								alt: language === "ar" ? "تبويب الأصول" : "Assets Tab",
								caption: language === "ar" ? "الأصول المعينة" : "Assigned Assets",
								stepTitle: language === "ar" ? "تبويب الأصول" : "Assets Tab",
								stepContent:
									language === "ar"
										? [
												"يسرد هذا التبويب جميع أصول الشركة المعينة للعضو.",
												"المعلومات المعروضة:",
												"• اسم الأصل",
												"• تاريخ التعيين",
												"• نوع الأصل",
												"• الرقم التسلسلي",
												"• حالة الأصل (نشط / مسترجع)",
											]
										: [
												"This tab lists all company assets assigned to the member.",
												"Displayed information:",
												"• Asset name",
												"• Assigned date",
												"• Asset type",
												"• Serial number",
												"• Asset status (Active / Returned)",
											],
								notices:
									language === "ar"
										? [
												"يجب إرجاع الأصول عند انتهاء العقد.",
												"يتم تتبع تعيينات الأصول للمساءلة.",
											]
										: [
												"Assets must be returned upon contract termination.",
												"Asset assignments are tracked for accountability.",
											],
							},
							{
								src: "https://i.postimg.cc/bJM18jCn/Whats_App_Image_2026_01_01_at_9_17_39_PM_(6).jpg",
								alt: language === "ar" ? "الرواتب والإقامة" : "Payroll & Residency",
								caption: language === "ar" ? "الرواتب وتفاصيل الإقامة" : "Payroll & Residency Details",
								stepTitle: language === "ar" ? "تبويبا الرواتب والإقامة" : "Payroll & Residency Tabs",
								stepContent:
									language === "ar"
										? [
												"تبويب الرواتب: يدير ويعرض معلومات الرواتب للعضو.",
												"ملخص الرواتب يشمل: الراتب الأساسي، إجمالي الأرباح، إجمالي الخصومات، صافي الراتب.",
												"عناصر الرواتب: يعرض كل عنصر اسم العنصر، النوع (كسب / خصم)، المبلغ، التاريخ الفعلي، الملاحظات.",
												"زر 'إضافة عنصر راتب' يسمح بالتعديلات اليدوية.",
												"تبويب الإقامة: يتتبع معلومات الإقامة والفيزا للامتثال.",
												"مدة الإقامة تعرض: تاريخ الإصدار، تاريخ الانتهاء، مؤشر الأيام المتبقية.",
												"تفاصيل الإقامة تشمل: رقم التصريح، نوع التصريح، دولة الإقامة، الحالة (نشط / منتهي).",
											]
										: [
												"Payroll Tab: Manages and displays payroll information for the member.",
												"Payroll Summary includes: Base salary, Total earnings, Total deductions, Net pay.",
												"Payroll Items: Each item shows Item name, Type (Earning / Deduction), Amount, Effective date, Notes.",
												"An Add Pay Item button allows manual adjustments.",
												"Residency Tab: Tracks residency and visa information for compliance.",
												"Residency Duration displays: Issue date, Expiry date, Remaining days indicator.",
												"Residency Details include: Permit number, Permit type, Country of residency, Status (Active / Expired).",
											],
								notices:
									language === "ar"
										? [
												"تعتمد بيانات الرواتب على الحضور، قواعد العقد، والإدخالات اليدوية.",
												"يتم حساب الخصومات والأرباح لكل دورة راتب.",
												"يعكس صافي الراتب المبلغ النهائي المستحق.",
												"تُستخدم تواريخ الانتهاء للتنبيهات والتذكيرات.",
												"من الضروري الحفاظ على بيانات الإقامة محدثة للامتثال القانوني.",
											]
										: [
												"Payroll data depends on attendance, contract rules, and manual entries.",
												"Deductions and earnings are calculated per payroll cycle.",
												"Net pay reflects final payable amount.",
												"Expiry dates are used for alerts and reminders.",
												"Keeping residency data updated is essential for legal compliance.",
											],
							},
						],
			},
		},
		{
			id: "invoice",
			label: language === "ar" ? "الفواتير" : "Invoice",
			icon: FileText,
			content: {
						title:
							language === "ar"
								? "دليل الفواتير"
								: "Invoice Guide",
						text:
							language === "ar"
								? [
										"تسمح وحدة الفواتير بإنشاء وإدارة وتتبع فواتير العملاء مع رؤية مالية كاملة.",
									]
								: [
										"The Invoices module enables the creation, management, and tracking of customer invoices with full financial visibility.",
									],
						images: [
							{
								src: "https://i.postimg.cc/brzdBNH0/Whats_App_Image_2026_01_02_at_10_41_25_PM.jpg",
								alt: language === "ar" ? "كتالوج الخدمات" : "Service Catalog",
								caption: language === "ar" ? "قائمة الأقسام" : "Departments List",
								stepTitle: language === "ar" ? "كتالوج الخدمات - الأقسام" : "Service Catalog - Departments",
								stepContent:
									language === "ar"
										? [
												"يسمح كتالوج الخدمات للمسؤولين بتعريف وإدارة الخدمات المقدمة من قبل المؤسسة. يعمل كأساس للفواتير، مما يضمن الاتساق في التسعير والرسوم وحسابات الضرائب عبر النظام.",
												"",
												"الأقسام:",
												"تمثل الأقسام وحدات الأعمال عالية المستوى أو المناطق الوظيفية داخل المؤسسة.",
												"",
												"قائمة الأقسام:",
												"يتضمن كل قسم:",
												"• معرف القسم",
												"• اسم القسم (بالإنجليزية)",
												"• الحالة (نشط / غير نشط)",
												"",
												"الإجراءات:",
												"• البحث عن الأقسام",
												"• التصفية والترتيب",
												"• إضافة قسم",
												"• تفعيل أو إلغاء تفعيل الأقسام",
											]
										: [
												"The Service Catalog module allows administrators to define and manage the services offered by the organization. It acts as the foundation for invoicing, ensuring consistency in pricing, fees, and tax calculations across the system.",
												"",
												"Departments:",
												"Departments represent high-level business units or functional areas within the organization.",
												"",
												"Departments List:",
												"Each department includes:",
												"• Department ID",
												"• Department Name (English)",
												"• Status (Active / Inactive)",
												"",
												"Actions:",
												"• Search departments",
												"• Filter and sort",
												"• Add Department",
												"• Activate or deactivate departments",
											],
								notices:
									language === "ar"
										? [
												"يجب أن تكون الأقسام نشطة ليتم استخدامها في الخدمات.",
												"الأقسام تساعد في هيكلة الخدمات والتقارير.",
											]
										: [
												"Departments must be active to be used in services.",
												"Departments help structure services and reporting.",
											],
							},
							{
								src: "https://i.postimg.cc/8c1s0PBm/Whats_App_Image_2026_01_02_at_10_41_31_PM_(1).jpg",
								alt: language === "ar" ? "الخدمات" : "Services",
								caption: language === "ar" ? "قائمة الخدمات" : "Services List",
								stepTitle: language === "ar" ? "الخدمات" : "Services",
								stepContent:
									language === "ar"
										? [
												"تمثل الخدمات العناصر القابلة للفوترة الفعلية التي يمكن إضافتها إلى الفواتير.",
												"",
												"قائمة الخدمات:",
												"يتضمن كل خدمة:",
												"• معرف الخدمة",
												"• اسم الخدمة",
												"• القسم",
												"• الفئة",
												"• رسوم الخدمة",
												"• الرسوم الحكومية",
												"• نسبة ضريبة القيمة المضافة",
												"• الحالة",
												"",
												"إضافة خدمة:",
												"عند إضافة خدمة جديدة، الحقول التالية مطلوبة:",
												"• اسم الخدمة (EN): الاسم الإنجليزي للخدمة.",
												"• اسم الخدمة (AR): الاسم العربي للخدمة.",
												"• القسم: القسم المسؤول عن الخدمة.",
												"• الفئة: فئة الخدمة تحت القسم المحدد.",
												"• رسوم الخدمة: رسوم الخدمة الأساسية المطلوبة من العميل.",
												"• الرسوم الحكومية: الرسوم الرسمية الإضافية (إن وجدت).",
												"• ضريبة القيمة المضافة %: نسبة ضريبة القيمة المضافة المطبقة.",
												"• الحالة: نشط أو غير نشط.",
											]
										: [
												"Services represent the actual billable items that can be added to invoices.",
												"",
												"Services List:",
												"Each service includes:",
												"• Service ID",
												"• Service Name",
												"• Department",
												"• Category",
												"• Service Charge",
												"• Government Fees",
												"• VAT Percentage",
												"• Status",
												"",
												"Add Service:",
												"When adding a new service, the following fields are required:",
												"• Service Name (EN): English name of the service.",
												"• Service Name (AR): Arabic name of the service.",
												"• Department: The department responsible for the service.",
												"• Category: The service category under the selected department.",
												"• Service Charge: Base service fee charged to the customer.",
												"• Government Fees: Additional official fees (if applicable).",
												"• VAT %: Applicable VAT percentage.",
												"• Status: Active or inactive.",
											],
								notices:
									language === "ar"
										? [
												"يمكن إضافة الخدمات النشطة فقط إلى الفواتير.",
												"يتم استخدام رسوم الخدمة والرسوم تلقائياً في حسابات الفواتير.",
												"يتم حساب ضريبة القيمة المضافة بناءً على النسبة المكونة.",
											]
										: [
												"Only active services can be added to invoices.",
												"Service charges and fees are automatically used in invoice calculations.",
												"VAT is calculated based on the configured percentage.",
											],
							},
							{
								src: "https://i.postimg.cc/gjYrTkqD/Whats_App_Image_2026_01_02_at_10_41_31_PM_(2).jpg",
								alt: language === "ar" ? "ملفات الفواتير - العملاء" : "Invoice Profiles - Customers",
								caption: language === "ar" ? "قائمة العملاء" : "Customers List",
								stepTitle: language === "ar" ? "ملفات الفواتير - العملاء" : "Invoice Profiles - Customers",
								stepContent:
									language === "ar"
										? [
												"تخزن وحدة ملفات الفواتير معلومات الفوترة والاتصال للعملاء والوكلاء. تبسط هذه الملفات إنشاء الفواتير وتضمن دقة بيانات العملاء.",
												"",
												"العملاء:",
												"يمثل العملاء الأفراد أو الشركات التي تستلم الفواتير.",
												"",
												"قائمة العملاء:",
												"يتضمن كل سجل عميل:",
												"• اسم العميل",
												"• النوع (فرد / شركة)",
												"• الرقم الضريبي / الهوية",
												"• رقم الاتصال",
												"• عنوان البريد الإلكتروني",
												"• الحالة",
												"",
												"إضافة عميل:",
												"عند إضافة عميل جديد، الحقول التالية مطلوبة:",
												"• اسم العميل: الاسم الكامل للعميل أو الشركة.",
												"• النوع: اختر ما إذا كان العميل فرداً أم شركة.",
												"• الرقم الضريبي / الهوية: رقم التسجيل الضريبي أو رقم الهوية.",
												"• رقم الاتصال: رقم الهاتف الأساسي.",
												"• عنوان البريد الإلكتروني: عنوان البريد الإلكتروني للفوترة.",
												"• الحالة: نشط أو غير نشط.",
											]
										: [
												"The Invoice Profiles module stores billing and contact information for customers and agents. These profiles simplify invoice creation and ensure accurate customer data.",
												"",
												"Customers:",
												"Customers represent individuals or companies that receive invoices.",
												"",
												"Customers List:",
												"Each customer record includes:",
												"• Customer Name",
												"• Type (Individual / Company)",
												"• TRN / ID",
												"• Contact Number",
												"• Email Address",
												"• Status",
												"",
												"Add Customer:",
												"When adding a new customer, the following fields are required:",
												"• Customer Name: Full name of the customer or company.",
												"• Type: Select whether the customer is an individual or a company.",
												"• TRN / ID: Tax Registration Number or identification number.",
												"• Contact Number: Primary phone number.",
												"• Email Address: Billing email address.",
												"• Status: Active or inactive.",
											],
								notices:
									language === "ar"
										? [
												"يمكن اختيار العملاء النشطين فقط في الفواتير.",
												"معلومات الرقم الضريبي الدقيقة مطلوبة للامتثال الضريبي.",
											]
										: [
												"Only active customers can be selected in invoices.",
												"Accurate TRN information is required for tax compliance.",
											],
							},
							{
								src: "https://i.postimg.cc/Y0pjsqfb/Whats_App_Image_2026_01_02_at_10_41_31_PM_(4).jpg",
								alt: language === "ar" ? "لوحة تحكم الفواتير" : "Invoices Dashboard",
								caption: language === "ar" ? "لوحة تحكم الفواتير" : "Invoices Dashboard",
								stepTitle: language === "ar" ? "لوحة تحكم الفواتير" : "Invoices Dashboard",
								stepContent:
									language === "ar"
										? [
												"توفر لوحة التحكم ملخصاً لنشاط الفواتير، بما في ذلك:",
												"• إجمالي الفواتير",
												"• المبلغ الإجمالي",
												"• إجمالي المستحقات",
												"• الفواتير المدفوعة",
												"• الفواتير المعلقة",
												"• مسودات الفواتير",
												"• الفواتير المدفوعة جزئياً",
												"",
												"حالات الفواتير:",
												"• مسودة",
												"• معلقة",
												"• مدفوعة جزئياً",
												"• مدفوعة بالكامل",
												"• ملغاة",
												"• مدفوعة حكومياً",
												"• باطلة",
											]
										: [
												"The dashboard provides a summary of invoice activity, including:",
												"• Total Invoices",
												"• Total Amount",
												"• Total Due",
												"• Paid Invoices",
												"• Pending Invoices",
												"• Draft Invoices",
												"• Partially Paid Invoices",
												"",
												"Invoice Statuses:",
												"• Draft",
												"• Pending",
												"• Partially Paid",
												"• Fully Paid",
												"• Cancelled",
												"• Void",
											],
								notices:
									language === "ar"
										? [
												"يتم تحديث إحصائيات لوحة التحكم تلقائياً.",
												"تعكس الحالات الحالة الحالية لكل فاتورة.",
											]
										: [
												"Dashboard statistics update automatically.",
												"Statuses reflect the current state of each invoice.",
											],
							},
							{
								src: "https://i.postimg.cc/hvSh5Pbb/Whats_App_Image_2026_01_02_at_10_41_31_PM_(3).jpg",
								alt: language === "ar" ? "قائمة الفواتير" : "Invoice List",
								caption: language === "ar" ? "قائمة الفواتير" : "Invoice List",
								stepTitle: language === "ar" ? "قائمة الفواتير" : "Invoice List",
								stepContent:
									language === "ar"
										? [
												"قائمة الفواتير:",
												"يتضمن كل سجل فاتورة:",
												"• رقم الفاتورة",
												"• اسم العميل",
												"• تاريخ الإنشاء",
												"• آخر تحديث",
												"• المبلغ",
												"• الحالة",
												"",
												"الإجراءات:",
												"• عرض تفاصيل الفاتورة",
												"• تعديل الفاتورة",
												"• وضع علامة كمعلقة",
												"• إلغاء الفاتورة",
												"• حذف الفاتورة",
												"• تصدير الفواتير",
											]
										: [
												"Invoice List:",
												"Each invoice record includes:",
												"• Invoice Number",
												"• Customer Name",
												"• Date Created",
												"• Last Updated",
												"• Amount",
												"• Status",
												"",
												"Actions:",
												"• View invoice details",
												"• Edit invoice",
												"• Mark as pending",
												"• Cancel invoice",
												"• Delete invoice",
												"• Export invoices",
											],
								notices:
									language === "ar"
										? [
												"يمكن البحث والتصفية والترتيب في قائمة الفواتير.",
												"يتم حفظ جميع التغييرات تلقائياً.",
											]
										: [
												"Invoice list can be searched, filtered, and sorted.",
												"All changes are automatically saved.",
											],
							},
							{
								src: "https://i.postimg.cc/x80q4Tyh/Whats_App_Image_2026_01_02_at_10_41_31_PM.jpg",
								alt: language === "ar" ? "إنشاء فاتورة - تفاصيل الفاتورة" : "Create Invoice - Invoice Details",
								caption: language === "ar" ? "تفاصيل الفاتورة" : "Invoice Details",
								stepTitle: language === "ar" ? "إنشاء فاتورة - تفاصيل الفاتورة" : "Create Invoice - Invoice Details",
								stepContent:
									language === "ar"
										? [
												"تسمح صفحة إنشاء الفاتورة للمستخدمين بإنشاء فواتير باستخدام الخدمات المحددة مسبقاً.",
												"",
												"تفاصيل الفاتورة:",
												"• الرمز المميز: مرجع داخلي اختياري.",
												"• رقم الفاتورة: يتم إنشاؤه تلقائياً بواسطة النظام.",
												"• الوكيل: اختيار وكيل اختياري.",
												"• اسم العميل (مطلوب): اختر من العملاء النشطين.",
												"• رقم الاتصال: يتم ملؤه تلقائياً من ملف العميل.",
												"• الملاحظات: معلومات إضافية اختيارية.",
											]
										: [
												"The Create Invoice page allows users to generate invoices using predefined services.",
												"",
												"Invoice Details:",
												"• Token: Optional internal reference.",
												"• Invoice Number: Automatically generated by the system.",
												"• Agent: Optional agent selection.",
												"• Customer Name (Required): Select from active customers.",
												"• Contact Number: Automatically populated from customer profile.",
												"• Notes: Optional additional information.",
											],
								notices:
									language === "ar"
										? [
												"يجب اختيار عميل نشط لإنشاء الفاتورة.",
												"يتم ملء معلومات الاتصال تلقائياً من ملف العميل.",
											]
										: [
												"An active customer must be selected to create the invoice.",
												"Contact information is automatically populated from customer profile.",
											],
							},
							{
								src: "https://i.postimg.cc/4yJnSNbL/Whats_App_Image_2026_01_02_at_10_41_31_PM_(6).jpg",
								alt: language === "ar" ? "إنشاء فاتورة - قسم الخدمات" : "Create Invoice - Services Section",
								caption: language === "ar" ? "قسم الخدمات" : "Services Section",
								stepTitle: language === "ar" ? "إنشاء فاتورة - قسم الخدمات" : "Create Invoice - Services Section",
								stepContent:
									language === "ar"
										? [
												"يمكن للمستخدمين إضافة خدمة واحدة أو أكثر إلى الفاتورة.",
												"",
												"لكل خدمة:",
												"• اسم الخدمة",
												"• سعر الوحدة (رسوم الخدمة)",
												"• الرسوم الحكومية",
												"• نسبة ضريبة القيمة المضافة",
												"• الخصومات (إن وجدت)",
												"• الغرامات (إن وجدت)",
												"",
												"يمكن للمستخدمين:",
												"• إضافة خدمات متعددة",
												"• إزالة الخدمات",
												"• تعديل قيم الخدمات (بناءً على الصلاحيات)",
											]
										: [
												"Users can add one or more services to the invoice.",
												"",
												"For each service:",
												"• Service name",
												"• Unit price (service charge)",
												"• Government fees",
												"• VAT percentage",
												"• Discounts (if applicable)",
												"• Fines (if applicable)",
												"",
												"Users can:",
												"• Add multiple services",
												"• Remove services",
												"• Edit service values (based on permissions)",
											],
								notices:
									language === "ar"
										? [
												"يتم استخدام قيم الخدمة من كتالوج الخدمات تلقائياً.",
												"يمكن تعديل القيم بناءً على الصلاحيات.",
											]
										: [
												"Service values from the service catalog are used automatically.",
												"Values can be edited based on permissions.",
											],
							},
							{
								src: "https://i.postimg.cc/90WznFtn/Whats_App_Image_2026_01_02_at_10_41_31_PM_(7).jpg",
								alt: language === "ar" ? "إنشاء فاتورة - معاينة الفاتورة" : "Create Invoice - Invoice Preview",
								caption: language === "ar" ? "معاينة الفاتورة" : "Invoice Preview",
								stepTitle: language === "ar" ? "إنشاء فاتورة - معاينة الفاتورة والحسابات" : "Create Invoice - Invoice Preview & Calculations",
								stepContent:
									language === "ar"
										? [
												"معاينة الفاتورة:",
												"تعرض المعاينة المباشرة:",
												"• تفاصيل الشركة",
												"• معلومات العميل",
												"• تاريخ الفاتورة",
												"• تفصيل الخدمات",
												"• المجموع الفرعي",
												"• مبلغ ضريبة القيمة المضافة",
												"• الإجمالي النهائي",
												"• منطقة التوقيع المصرح به",
												"",
												"الإجراءات:",
												"• حفظ كمسودة",
												"• حفظ الفاتورة",
												"• طباعة الفاتورة",
												"",
												"حسابات الفاتورة:",
												"المجموع الفرعي = رسوم الخدمة + الرسوم الحكومية",
												"ضريبة القيمة المضافة = محسوبة لكل خدمة بناءً على نسبة ضريبة القيمة المضافة %",
												"الإجمالي النهائي = المجموع الفرعي + ضريبة القيمة المضافة – الخصومات + الغرامات",
											]
										: [
												"Invoice Preview:",
												"A live preview displays:",
												"• Company details",
												"• Customer information",
												"• Invoice date",
												"• Services breakdown",
												"• Subtotal",
												"• VAT amount",
												"• Grand total",
												"• Authorized signature area",
												"",
												"Actions:",
												"• Save as Draft",
												"• Save Invoice",
												"• Print invoice",
												"",
												"Invoice Calculations:",
												"Subtotal = Service charges + government fees",
												"VAT = Calculated per service based on VAT %",
												"Grand Total = Subtotal + VAT – discounts + fines",
											],
								notices:
									language === "ar"
										? [
												"تحدث الحسابات في الوقت الفعلي.",
												"يتم تطبيق الخدمات المعتمدة وإعدادات ضريبة القيمة المضافة فقط.",
												"يتم قفل إجماليات الفواتير بمجرد دفعها بالكامل.",
												"",
												"أفضل الممارسات والملاحظات:",
												"• حافظ على كتالوج خدمات محدث لتجنب أخطاء التسعير.",
												"• تحقق دائماً من الرقم الضريبي للعميل وتفاصيل الاتصال.",
												"• استخدم مسودات الفواتير للمراجعة قبل الإنهاء.",
												"• تجنب حذف الفواتير إلا إذا كان ذلك ضرورياً تماماً.",
												"• استخدم التقارير لتتبع الإيرادات والمستحقات المستحقة.",
											]
										: [
												"Calculations update in real time.",
												"Only approved services and VAT settings are applied.",
												"Invoice totals are locked once fully paid.",
												"",
												"Best Practices & Notes:",
												"• Maintain an up-to-date service catalog to avoid pricing errors.",
												"• Always verify customer TRN and contact details.",
												"• Use draft invoices for review before finalizing.",
												"• Avoid deleting invoices unless absolutely necessary.",
												"• Use reports to track revenue and outstanding dues.",
											],
							},
						],
			},
		},
		{
			id: "messages",
			label: language === "ar" ? "الرسائل" : "Messages",
			icon: FileText,
			content: {
						title:
							language === "ar"
								? "دليل الرسائل"
								: "Messages Guide",
						text:
							language === "ar"
								? [
										"توفر وحدة الرسائل التواصل الداخلي في الوقت الفعلي بين الموظفين من خلال المحادثات الفردية والمحادثات الجماعية، متاحة على كل من لوحة التحكم (الويب) وتطبيق الجوال.",
										"تمكن من التعاون السريع، المراسلة الآمنة، والتواصل السلس عبر الفرق والأقسام.",
									]
								: [
										"The Messages module provides real-time internal communication between employees through one-to-one chats and group conversations, available on both the Dashboard (Web) and the Mobile App.",
										"It enables fast collaboration, secure messaging, and seamless communication across teams and departments.",
									],
						images: [
							{
								src: "https://i.postimg.cc/qvXKQST6/Whats_App_Image_2026_01_02_at_11_00_17_PM_(1).jpg",
								alt: language === "ar" ? "الرسائل على لوحة التحكم" : "Messages on Dashboard",
								caption: language === "ar" ? "نظرة عامة على صندوق الوارد" : "Inbox Overview",
								stepTitle: language === "ar" ? "الرسائل على لوحة التحكم (الويب)" : "Messages on Dashboard (Web)",
								stepContent:
									language === "ar"
										? [
												"تم تصميم واجهة المراسلة في لوحة التحكم للتواصل الفعال أثناء العمل على سطح المكتب.",
												"",
												"نظرة عامة على صندوق الوارد:",
												"يعرض صندوق الوارد جميع المحادثات في قائمة منظمة.",
												"",
												"يعرض كل محادثة:",
												"• اسم المستخدم أو المجموعة",
												"• دور المستخدم (إن وجد)",
												"• معاينة آخر رسالة",
												"• الطابع الزمني للرسالة",
												"• حالة الاتصال / عدم الاتصال (للمستخدمين)",
												"",
												"التبويبات المتاحة:",
												"• المحادثات – محادثات فردية",
												"• المجموعات – محادثات جماعية",
												"",
												"الميزات:",
												"• البحث عن المحادثات بالاسم",
												"• الوصول السريع إلى المحادثات الأخيرة",
												"• التبديل بسهولة بين المحادثات والمجموعات",
											]
										: [
												"The dashboard messaging interface is designed for efficient communication while working on desktop.",
												"",
												"Inbox Overview:",
												"The Inbox displays all conversations in a structured list.",
												"",
												"Each chat shows:",
												"• User or group name",
												"• User role (if applicable)",
												"• Last message preview",
												"• Message timestamp",
												"• Online / Offline status (for users)",
												"",
												"Tabs available:",
												"• Chats – One-to-one conversations",
												"• Groups – Group conversations",
												"",
												"Features:",
												"• Search chats by name",
												"• Quick access to recent conversations",
												"• Switch easily between chats and groups",
											],
								notices:
									language === "ar"
										? [
												"يتم تسليم الرسائل في الوقت الفعلي.",
												"يتم الحفاظ على سجل المحادثة للمرجعية.",
											]
										: [
												"Messages are delivered in real time.",
												"Chat history is preserved for reference.",
											],
							},
							{
								src: "https://i.postimg.cc/W16ZSCvJ/Whats_App_Image_2026_01_02_at_11_00_17_PM.jpg",
								alt: language === "ar" ? "محادثة فردية (لوحة التحكم)" : "One-to-One Chat (Dashboard)",
								caption: language === "ar" ? "محادثة فردية" : "One-to-One Chat",
								stepTitle: language === "ar" ? "محادثة فردية (لوحة التحكم)" : "One-to-One Chat (Dashboard)",
								stepContent:
									language === "ar"
										? [
												"يمكن للمستخدمين التواصل مباشرة مع الأعضاء الآخرين.",
												"",
												"أنواع الرسائل المدعومة:",
												"• الرسائل النصية",
												"• الرسائل الصوتية",
												"• المرفقات (الملفات، الصور)",
												"• ردود الرسائل",
												"",
												"مؤشرات المحادثة:",
												"• اسم المرسل",
												"• الطابع الزمني للرسالة",
												"• مدة الرسالة الصوتية",
												"• حالة المشاهدة / التسليم (إن تم تفعيلها)",
											]
										: [
												"Users can communicate directly with other members.",
												"",
												"Supported Message Types:",
												"• Text messages",
												"• Voice messages",
												"• Attachments (files, images)",
												"• Message replies",
												"",
												"Chat Indicators:",
												"• Sender name",
												"• Message timestamp",
												"• Voice message duration",
												"• Seen / delivery status (if enabled)",
											],
								notices:
									language === "ar"
										? [
												"يتم تسليم الرسائل في الوقت الفعلي.",
												"يتم الحفاظ على سجل المحادثة للمرجعية.",
											]
										: [
												"Messages are delivered in real time.",
												"Chat history is preserved for reference.",
											],
							},
							{
								src: "https://i.postimg.cc/dVmCnpYk/Whats_App_Image_2026_01_02_at_11_00_55_PM.jpg",
								alt: language === "ar" ? "المحادثة الجماعية (لوحة التحكم)" : "Group Chat (Dashboard)",
								caption: language === "ar" ? "إنشاء مجموعة" : "Create Group",
								stepTitle: language === "ar" ? "المحادثة الجماعية (لوحة التحكم)" : "Group Chat (Dashboard)",
								stepContent:
									language === "ar"
										? [
												"تسمح المحادثات الجماعية بالتواصل مع عدة أعضاء في وقت واحد.",
												"",
												"إنشاء مجموعة (لوحة التحكم):",
												"لإنشاء مجموعة:",
												"• انقر على أيقونة ➕ (إضافة) في صندوق الوارد.",
												"• اختر محادثة جماعية.",
												"• أضف الأعضاء عن طريق:",
												"  - الاسم",
												"  - المعرف",
												"  - البريد الإلكتروني",
												"• انقر على التالي.",
												"• أدخل تفاصيل المجموعة وأكد.",
												"",
												"تفاصيل المجموعة:",
												"• اسم المجموعة",
												"• صورة المجموعة",
												"• قائمة الأعضاء",
												"• مؤشر الأعضاء المتصلين",
											]
										: [
												"Group chats allow communication with multiple members at once.",
												"",
												"Create Group (Dashboard):",
												"To create a group:",
												"• Click the ➕ (Add) icon in the Inbox.",
												"• Select Group Chat.",
												"• Add members by:",
												"  - Name",
												"  - ID",
												"  - Email",
												"• Click Next.",
												"• Enter group details and confirm.",
												"",
												"Group Details:",
												"• Group name",
												"• Group image",
												"• Member list",
												"• Online members indicator",
											],
								notices:
									language === "ar"
										? [
												"يمكن فقط للأعضاء المضافين عرض رسائل المجموعة.",
												"يمكن لمنشئي المجموعة إدارة الأعضاء (بناءً على الصلاحيات).",
											]
										: [
												"Only added members can view group messages.",
												"Group creators can manage members (based on permissions).",
											],
							},
							{
								src: "https://i.postimg.cc/KYGMWfGK/Whats_App_Image_2026_01_02_at_11_05_28_PM.jpg",
								alt: language === "ar" ? "الرسائل على تطبيق الجوال" : "Messages on Mobile App",
								caption: language === "ar" ? "صندوق الوارد (الجوال)" : "Inbox (Mobile)",
								stepTitle: language === "ar" ? "الرسائل على تطبيق الجوال" : "Messages on Mobile App",
								stepContent:
									language === "ar"
										? [
												"تجربة المراسلة على الجوال تعكس وظائف لوحة التحكم، محسّنة للاستخدام باللمس والاستخدام أثناء التنقل.",
												"",
												"صندوق الوارد (الجوال):",
												"يعرض صندوق الوارد على الجوال:",
												"• قائمة المحادثات الأخيرة",
												"• المجموعات والمحادثات الفردية",
												"• معاينة آخر رسالة",
												"• وقت الرسالة",
												"",
												"التبويبات:",
												"• المحادثات",
												"• المجموعات",
												"",
												"الميزات:",
												"• البحث عن المحادثات",
												"• تحديث المحادثات",
												"• إنشاء محادثة أو مجموعة جديدة",
											]
										: [
												"The mobile messaging experience mirrors the dashboard functionality, optimized for touch and on-the-go use.",
												"",
												"Inbox (Mobile):",
												"The mobile inbox displays:",
												"• List of recent chats",
												"• Groups and individual conversations",
												"• Last message preview",
												"• Message time",
												"",
												"Tabs:",
												"• Chats",
												"• Groups",
												"",
												"Features:",
												"• Search chats",
												"• Refresh conversations",
												"• Create new chat or group",
											],
								notices:
									language === "ar"
										? [
												"تتزامن الرسائل تلقائياً مع لوحة التحكم.",
											]
										: [
												"Messages sync automatically with the dashboard.",
											],
							},
							{
								src: "https://i.postimg.cc/6QWvPcWq/Whats_App_Image_2026_01_02_at_11_05_27_PM.jpg",
								alt: language === "ar" ? "محادثة فردية (الجوال)" : "One-to-One Chat (Mobile)",
								caption: language === "ar" ? "محادثة فردية" : "One-to-One Chat",
								stepTitle: language === "ar" ? "محادثة فردية (الجوال)" : "One-to-One Chat (Mobile)",
								stepContent:
									language === "ar"
										? [
												"يمكن للمستخدمين إرسال:",
												"• الرسائل النصية",
												"• الملاحظات الصوتية",
												"• المرفقات",
												"",
												"واجهة المحادثة:",
												"• فقاعات رسائل نظيفة",
												"• اسم المرسل والدور",
												"• الطابع الزمني لكل رسالة",
												"• عناصر التحكم في تشغيل الصوت",
											]
										: [
												"Users can send:",
												"• Text messages",
												"• Voice notes",
												"• Attachments",
												"",
												"Chat Interface:",
												"• Clean message bubbles",
												"• Sender name and role",
												"• Timestamp per message",
												"• Voice playback controls",
											],
								notices:
									language === "ar"
										? [
												"تعمل الرسائل الصوتية مباشرة في المحادثة.",
												"تتزامن الرسائل تلقائياً مع لوحة التحكم.",
											]
										: [
												"Voice messages play directly in the chat.",
												"Messages sync automatically with the dashboard.",
											],
							},
							{
								src: "https://i.postimg.cc/bvyt5gyv/Whats_App_Image_2026_01_02_at_11_05_26_PM.jpg",
								alt: language === "ar" ? "المحادثة الجماعية (الجوال)" : "Group Chat (Mobile)",
								caption: language === "ar" ? "إنشاء مجموعة" : "Create Group",
								stepTitle: language === "ar" ? "المحادثة الجماعية (الجوال)" : "Group Chat (Mobile)",
								stepContent:
									language === "ar"
										? [
												"إنشاء مجموعة (الجوال):",
												"لإنشاء مجموعة:",
												"• اضغط على زر ➕.",
												"• اختر مجموعة جديدة.",
												"• اختر الأعضاء من قائمة الموظفين.",
												"• اضغط على التالي.",
												"• أضف:",
												"  - اسم المجموعة",
												"  - صورة المجموعة (اختياري)",
												"• اضغط على إنشاء مجموعة.",
												"",
												"إدارة المجموعة:",
												"• عرض أعضاء المجموعة",
												"• تعديل اسم المجموعة أو الصورة",
												"• متابعة المراسلة فوراً بعد الإنشاء",
												"",
												"مزامنة الرسائل:",
												"• الرسائل المرسلة من لوحة التحكم تظهر فوراً على الجوال",
												"• الرسائل المرسلة من الجوال تظهر فوراً على لوحة التحكم",
												"• سجل المحادثة مشترك عبر جميع الأجهزة",
											]
										: [
												"Create Group (Mobile):",
												"To create a group:",
												"• Tap the ➕ button.",
												"• Select New Group.",
												"• Choose members from the employee list.",
												"• Tap Next.",
												"• Add:",
												"  - Group name",
												"  - Group photo (optional)",
												"• Tap Create Group.",
												"",
												"Group Management:",
												"• View group members",
												"• Edit group name or image",
												"• Continue messaging instantly after creation",
												"",
												"Message Synchronization:",
												"• Messages sent from dashboard appear instantly on mobile",
												"• Messages sent from mobile appear instantly on dashboard",
												"• Chat history is shared across all devices",
											],
								notices:
									language === "ar"
										? [
												"",
												"أفضل الممارسات والملاحظات:",
												"• استخدم المحادثات الجماعية للتواصل مع الفريق أو المشروع.",
												"• استخدم المحادثات المباشرة للمناقشات الخاصة.",
												"• حافظ على أسماء المجموعات واضحة وذات معنى.",
												"• تجنب مشاركة البيانات الحساسة إلا إذا كان مصرحاً بذلك.",
												"• تأكد من تفعيل الإشعارات على الجوال للتنبيهات في الوقت الفعلي.",
											]
										: [
												"",
												"Best Practices & Notes:",
												"• Use group chats for team or project communication.",
												"• Use direct chats for private discussions.",
												"• Keep group names clear and meaningful.",
												"• Avoid sharing sensitive data unless authorized.",
												"• Ensure notifications are enabled on mobile for real-time alerts.",
											],
							},
						],
			},
		},
		{
			id: "mobile-attendance-requests",
			label: language === "ar" ? "الحضور والطلبات (الجوال)" : "Mobile Attendance & Requests",
			icon: FileText,
			content: {
						title:
							language === "ar"
								? "دليل الحضور والطلبات على الجوال"
								: "Mobile Attendance & Requests Guide",
						text:
							language === "ar"
								? [
										"تسمح وحدة الحضور والطلبات على الجوال للموظفين بتقديم طلبات الحضور والعمل الإضافي والإجازة مباشرة من التطبيق المحمول، بينما تمكن المديرين والمسؤولين من مراجعة وموافقة أو رفض الطلبات مع رؤية كاملة وتتبع.",
									]
								: [
										"The Mobile Attendance & Requests module allows employees to submit attendance, overtime, and leave requests directly from the mobile application, while enabling managers and administrators to review, approve, or reject requests with full visibility and tracking.",
									],
						images: [
							{
								src: "https://i.postimg.cc/wBWGKKFb/Screenshot_2026_01_02_181058.png",
								alt: language === "ar" ? "نظرة عامة على الحضور (الجوال)" : "Attendance Overview (Mobile)",
								caption: language === "ar" ? "لوحة تحكم الحضور" : "Attendance Dashboard",
								stepTitle: language === "ar" ? "نظرة عامة على الحضور (الجوال)" : "Attendance Overview (Mobile)",
								stepContent:
									language === "ar"
										? [
												"توفر لوحة تحكم الحضور لمحة سريعة عن أداء الحضور للموظف.",
												"",
												"ملخص الحضور:",
												"• يعرض نسبة الحضور للفترة المحددة",
												"• المقارنة مع الفترة السابقة",
												"• مؤشرات بصرية لـ:",
												"  - التأخيرات",
												"  - أيام الإجازة",
												"  - الحضور في الوقت المحدد",
												"",
												"الإحصائيات الشخصية:",
												"• أيام الغياب (المستخدمة مقابل المسموح بها)",
												"• ساعات العمل الإضافي",
												"• عدد التأخيرات",
												"• حالة العقد",
												"",
												"طلبات سريعة (الجوال):",
												"في أسفل لوحة التحكم، يمكن للمستخدمين تقديم الطلبات باستخدام أزرار الإجراءات السريعة:",
												"• طلب الحضور",
												"• طلب العمل الإضافي",
												"• طلب الإجازة",
												"",
												"تسمح هذه الاختصارات بالتقديم السريع دون التنقل بعيداً عن لوحة التحكم.",
											]
										: [
												"The Attendance Dashboard provides a quick snapshot of the employee's attendance performance.",
												"",
												"Attendance Summary:",
												"• Displays attendance percentage for the selected period",
												"• Comparison with the previous period",
												"• Visual indicators for:",
												"  - Late arrivals",
												"  - Days off",
												"  - On-time attendance",
												"",
												"Personal Stats:",
												"• Absence days (used vs allowed)",
												"• Overtime hours",
												"• Late arrivals count",
												"• Contract status",
												"",
												"Quick Requests (Mobile):",
												"At the bottom of the dashboard, users can submit requests using quick action buttons:",
												"• Attendance Request",
												"• Overtime Request",
												"• Leave Request",
												"",
												"These shortcuts allow fast submission without navigating away from the dashboard.",
											],
								notices:
									language === "ar"
										? [
												"يمكن للموظفين الوصول إلى لوحة التحكم من التطبيق المحمول في أي وقت.",
												"يتم تحديث البيانات تلقائياً عند تقديم الطلبات أو الموافقة عليها.",
											]
										: [
												"Employees can access the dashboard from the mobile app at any time.",
												"Data is automatically updated when requests are submitted or approved.",
											],
							},
							{
								src: "https://i.postimg.cc/LXn02y00/Whats_App_Image_2026_01_02_at_6_09_49_PM.jpg",
								alt: language === "ar" ? "طلب الحضور (الجوال)" : "Attendance Request (Mobile)",
								caption: language === "ar" ? "نموذج طلب الحضور" : "Attendance Request Form",
								stepTitle: language === "ar" ? "طلب الحضور (الجوال)" : "Attendance Request (Mobile)",
								stepContent:
									language === "ar"
										? [
												"يُستخدم نموذج طلب الحضور عندما يحتاج الموظف إلى تقديم أو تصحيح سجل تسجيل الدخول أو الخروج.",
												"",
												"الحقول:",
												"• الوقت: يعرض الوقت الحالي أو المحدد للطلب.",
												"• نوع الطلب: الخيارات تشمل:",
												"  - تسجيل الدخول",
												"  - تسجيل الخروج",
												"  (قد تكون بعض الخيارات معطلة إذا تم تنفيذها بالفعل.)",
												"• حالة الموقع (GPS): يوضح ما إذا كان الطلب:",
												"  - داخل المنطقة المسموح بها",
												"  - خارج المنطقة",
												"",
												"تتبع GPS:",
												"يتم التقاط النظام:",
												"• موقع تسجيل الدخول الدقيق",
												"• نصف قطر المكتب",
												"• المسافة من المنطقة المسموح بها",
												"• عرض الخريطة مع العلامات",
												"",
												"بمجرد الإرسال، يتم إرسال الطلب للموافقة.",
											]
										: [
												"The Attendance Request form is used when an employee needs to submit or correct a clock-in or clock-out record.",
												"",
												"Fields:",
												"• Time: Displays the current or selected time for the request.",
												"• Request Type: Options include:",
												"  - Clock In",
												"  - Clock Out",
												"  (Some options may be disabled if already performed.)",
												"• Location Status (GPS): Shows whether the request is:",
												"  - Inside the allowed zone",
												"  - Out of Zone",
												"",
												"GPS Tracking:",
												"The system captures:",
												"• Exact check-in location",
												"• Office radius",
												"• Distance from allowed zone",
												"• Map view with markers",
												"",
												"Once submitted, the request is sent for approval.",
											],
								notices:
									language === "ar"
										? [
												"موقع GPS إلزامي لطلبات الحضور.",
												"يتم وضع علامة على الطلبات المقدمة خارج المنطقة المسموح بها.",
												"تتطلب طلبات الحضور موافقة المسؤول قبل التطبيق.",
												"إذا قمت بتقديم طلب خارج المنطقة، يمكن للمسؤول أو الموارد البشرية قبول أو رفض طلبك.",
												"تعمل طلبات الحضور فقط خلال وقت الدوام، وإذا لم يكن وقت الدوام، سيتم إظهار تنبيه.",
											]
										: [
												"GPS location is mandatory for attendance requests.",
												"Requests submitted outside the allowed zone are flagged.",
												"Attendance requests require admin approval before being applied.",
												"If you applied out of zone, the admin or HR can accept or reject your request.",
												"Attendance requests only work during shift time; if it's not shift time, an alert will be displayed.",
											],
							},
							{
								src: "https://i.postimg.cc/k4Bhqjhj/Whats_App_Image_2026_01_02_at_6_09_49_PM_(1).jpg",
								alt: language === "ar" ? "طلب الإجازة (الجوال)" : "Leave Request (Mobile)",
								caption: language === "ar" ? "نموذج طلب الإجازة" : "Leave Request Form",
								stepTitle: language === "ar" ? "طلب الإجازة (الجوال)" : "Leave Request (Mobile)",
								stepContent:
									language === "ar"
										? [
												"يسمح نموذج طلب الإجازة للموظفين بالتقدم بطلب للحصول على إجازة.",
												"",
												"الحقول:",
												"• نوع الإجازة (مطلوب):",
												"  - الإجازة السنوية",
												"  - الإجازة المرضية",
												"  - الإجازة العادية",
												"• تاريخ البدء وتاريخ الانتهاء (مطلوب):",
												"  يحدد مدة الإجازة.",
												"• السبب:",
												"  شرح اختياري (حتى 200 حرف).",
												"• إرفاق المستندات (اختياري):",
												"  الصيغ المدعومة: JPEG، PNG، PDF، MP4",
												"  الحد الأقصى للحجم: 50 ميجابايت",
												"",
												"بعد الإرسال، يدخل الطلب في سير عمل الموافقة.",
											]
										: [
												"The Leave Request form allows employees to apply for time off.",
												"",
												"Fields:",
												"• Leave Type (Required):",
												"  Examples: Annual Leave, Sick Leave, Casual Leave",
												"• Start Date & End Date (Required):",
												"  Defines the leave duration.",
												"• Reason:",
												"  Optional explanation (up to 200 characters).",
												"• Attach Documents (Optional):",
												"  Supported formats: JPEG, PNG, PDF, MP4",
												"  Maximum size: 50 MB",
												"",
												"After submission, the request enters the approval workflow.",
											],
								notices:
									language === "ar"
										? [
												"يتم تطبيق التحقق من رصيد الإجازة تلقائياً.",
												"قد تتطلب بعض أنواع الإجازة مرفقات (مثل الإجازة المرضية).",
												"تواريخ الإجازة تؤثر على حسابات الحضور والرواتب.",
											]
										: [
												"Leave balance validation is applied automatically.",
												"Some leave types may require attachments (e.g., sick leave).",
												"Leave dates affect attendance and payroll calculations.",
											],
							},
							{
								src: "https://i.postimg.cc/nL5Njb7F/Whats-App-Image-2026-01-02-at-3-13-21-PM.jpg",
								alt: language === "ar" ? "طلب العمل الإضافي (الجوال)" : "Overtime Request (Mobile)",
								caption: language === "ar" ? "نموذج طلب العمل الإضافي" : "Overtime Request Form",
								stepTitle: language === "ar" ? "طلب العمل الإضافي (الجوال)" : "Overtime Request (Mobile)",
								stepContent:
									language === "ar"
										? [
												"تسمح ميزة طلب العمل الإضافي للموظفين بتقديم ساعات العمل الإضافي للموافقة.",
												"",
												"الميزات:",
												"• حساب تلقائي لمدة العمل الإضافي",
												"• مرتبط بسجلات الحضور",
												"• يتطلب الموافقة قبل التضمين في الرواتب",
											]
										: [
												"The Overtime Request feature allows employees to submit overtime hours for approval.",
												"",
												"Features:",
												"• Automatic calculation of overtime duration",
												"• Linked to attendance records",
												"• Approval required before payroll inclusion",
											],
								notices:
									language === "ar"
										? [
												"يتم إضافة العمل الإضافي المعتمد فقط إلى الرواتب.",
												"قد تكون طلبات العمل الإضافي مقيدة بقواعد العقد.",
											]
										: [
												"Only approved overtime is added to payroll.",
												"Overtime requests may be restricted by contract rules.",
											],
							},
							{
								src: "https://i.postimg.cc/9fxn331k/Screenshot_2026_01_01_220417.png",
								alt: language === "ar" ? "إدارة الطلبات (لوحة التحكم)" : "Requests Management (Admin Panel)",
								caption: language === "ar" ? "صفحة الطلبات" : "Requests Page",
								stepTitle: language === "ar" ? "إدارة الطلبات (لوحة التحكم)" : "Requests Management (Admin Panel)",
								stepContent:
									language === "ar"
										? [
												"يمكن للمسؤولين والمديرين مراجعة جميع الطلبات المقدمة من صفحة الطلبات.",
												"",
												"أنواع الطلبات:",
												"• الحضور",
												"• الإجازة (الإجازة)",
												"• العمل الإضافي",
												"",
												"حالة الطلب:",
												"يمكن أن يكون كل طلب:",
												"• معلق",
												"• معتمد",
												"• مرفوض",
												"",
												"تفاصيل طلب الحضور (المسؤول):",
												"عند عرض طلب الحضور، يمكن للمسؤولين رؤية:",
												"• معرف الطلب",
												"• اسم العضو",
												"• نوع الطلب (تسجيل الدخول / تسجيل الخروج)",
												"• التاريخ والوقت",
												"• حالة GPS (داخل / خارج المنطقة)",
												"• الموقع الدقيق على الخريطة",
												"• مقارنة نصف قطر المكتب",
												"",
												"الإجراءات:",
												"• الموافقة على الطلب",
												"• رفض الطلب",
												"",
												"تفاصيل طلب الإجازة (المسؤول):",
												"يمكن للمسؤولين مراجعة:",
												"• نوع الإجازة",
												"• المدة وإجمالي الأيام",
												"• السبب",
												"• المرفقات (إن وجدت)",
												"• تاريخ الإرسال",
												"",
												"الإجراءات:",
												"• الموافقة على الإجازة",
												"• رفض الإجازة",
											]
										: [
												"Administrators and managers can review all submitted requests from the Requests page.",
												"",
												"Request Types:",
												"• Attendance",
												"• Time Off (Leave)",
												"• Overtime",
												"",
												"Request Status:",
												"Each request can be:",
												"• Pending",
												"• Approved",
												"• Rejected",
												"",
												"Attendance Request Details (Admin):",
												"When viewing an attendance request, admins can see:",
												"• Request ID",
												"• Member name",
												"• Request type (Clock-In / Clock-Out)",
												"• Date and time",
												"• GPS status (Inside / Out of Zone)",
												"• Exact location on map",
												"• Office radius comparison",
												"",
												"Actions:",
												"• Approve request",
												"• Reject request",
												"",
												"Leave Request Details (Admin):",
												"Admins can review:",
												"• Leave type",
												"• Duration and total days",
												"• Reason",
												"• Attachments (if provided)",
												"• Submission date",
												"",
												"Actions:",
												"• Approve leave",
												"• Reject leave",
											],
								notices:
									language === "ar"
										? [
												"يتم عرض بيانات الموقع للتدقيق والامتثال.",
												"يجب مراجعة الطلبات خارج المنطقة بعناية.",
												"تحدث تحديثات الإجازة المعتمدة تلقائياً في سجلات الحضور.",
												"تؤثر موافقة الإجازة على الرواتب وتتبع الغياب.",
												"",
												"أفضل الممارسات والملاحظات:",
												"• يجب على الموظفين تقديم الطلبات في أقرب وقت ممكن.",
												"• يجب تفعيل أذونات GPS لطلبات الحضور.",
												"• يجب على المديرين مراجعة الطلبات خارج المنطقة بعناية.",
												"• أرفق المستندات الداعمة عند الحاجة.",
												"• يتم تسجيل جميع الطلبات المعتمدة لأغراض التدقيق.",
											]
										: [
												"Location data is shown for audit and compliance.",
												"Out-of-zone requests should be reviewed carefully.",
												"Approved leave updates attendance records automatically.",
												"Leave approval affects payroll and absence tracking.",
												"",
												"Best Practices & Notes:",
												"• Employees should submit requests as soon as possible.",
												"• GPS permissions must be enabled for attendance requests.",
												"• Managers should review out-of-zone requests carefully.",
												"• Attach supporting documents when required.",
												"• All approved requests are logged for audit purposes.",
											],
							},
						],
			},
		},
		{
			id: "help-support",
			label: language === "ar" ? "المساعدة والدعم" : "Help & Support",
			icon: FileText,
			content: {
						title:
							language === "ar"
								? "دليل المساعدة والدعم"
								: "Help & Support Guide",
						text:
							language === "ar"
								? [
										"تسمح وحدة المساعدة والدعم للمستخدمين بتقديم طلبات الدعم، وتتبع حالتها، والتواصل مع فريق الدعم من خلال واجهة محادثة متكاملة.",
										"الوحدة متاحة على كل من لوحة التحكم (الويب) وتطبيق الجوال، مما يضمن الوصول إلى الدعم في أي وقت وفي أي مكان.",
									]
								: [
										"The Help & Support module allows users to submit support requests, track their status, and communicate with the support team through an integrated chat interface.",
										"The module is available on both the Dashboard (Web) and the Mobile App, ensuring support access anytime, anywhere.",
									],
						images: [
							{
								src: "https://i.postimg.cc/hjzZJTJr/Screenshot_2026_01_02_231929.png",
								alt: language === "ar" ? "المساعدة والدعم على لوحة التحكم" : "Help & Support on Dashboard",
								caption: language === "ar" ? "نظرة عامة على التذاكر" : "Tickets Overview",
								stepTitle: language === "ar" ? "المساعدة والدعم على لوحة التحكم (الويب)" : "Help & Support on Dashboard (Web)",
								stepContent:
									language === "ar"
										? [
												"توفر لوحة التحكم رؤية كاملة وإدارة لجميع تذاكر الدعم.",
												"",
												"نظرة عامة على التذاكر:",
												"تعرض صفحة المساعدة والدعم جميع التذاكر في جدول منظم.",
												"",
												"أعمدة قائمة التذاكر:",
												"يعرض كل تذكرة:",
												"• معرف التذكرة",
												"• الموضوع",
												"• الفئة",
												"• طلب من قبل",
												"• تم الإرسال في",
												"• الحالة (مفتوح، قيد المعالجة، تم الحل)",
												"• المشاهدات",
												"",
												"التبويبات:",
												"• الواردة – التذاكر المستلمة من المستخدم أو الفريق",
												"• الخاصة بي – التذاكر التي أنشأها المستخدم المسجل دخوله",
												"",
												"الإجراءات:",
												"• البحث عن التذاكر",
												"• التصفية والترتيب",
												"• عرض تفاصيل التذكرة",
												"• فتح محادثة التذكرة",
											]
										: [
												"The dashboard provides full visibility and management of all support tickets.",
												"",
												"Tickets Overview:",
												"The Help & Support page displays all tickets in a structured table.",
												"",
												"Ticket List Columns:",
												"Each ticket shows:",
												"• Ticket ID",
												"• Subject",
												"• Category",
												"• Requested By",
												"• Submitted At",
												"• Status (Open, In Progress, Resolved)",
												"• Views",
												"",
												"Tabs:",
												"• Incoming – Tickets received by the user or team",
												"• Own – Tickets created by the logged-in user",
												"",
												"Actions:",
												"• Search tickets",
												"• Filter and sort",
												"• View ticket details",
												"• Open ticket chat",
											],
								notices:
									language === "ar"
										? [
												"يمكن البحث والتصفية والترتيب في قائمة التذاكر.",
												"تعرض التبويبات التذاكر حسب نوعها.",
											]
										: [
												"Ticket list can be searched, filtered, and sorted.",
												"Tabs display tickets by their type.",
											],
							},
							{
								src: "https://i.postimg.cc/ZRBs9p9x/Screenshot_2026_01_02_231938.png",
								alt: language === "ar" ? "تفاصيل التذكرة (لوحة التحكم)" : "Ticket Details (Dashboard)",
								caption: language === "ar" ? "تفاصيل التذكرة" : "Ticket Details",
								stepTitle: language === "ar" ? "تفاصيل التذكرة (لوحة التحكم)" : "Ticket Details (Dashboard)",
								stepContent:
									language === "ar"
										? [
												"عند فتح تذكرة، تنقسم الصفحة إلى قسمين:",
												"",
												"لوحة معلومات التذكرة:",
												"تعرض:",
												"• معرف التذكرة",
												"• طلب من قبل",
												"• المستلمون في نسخة",
												"• الموضوع",
												"• الوصف",
												"• الفئة",
												"• الأولوية (منخفضة / متوسطة / عالية)",
												"• النوع (دعم، استفسار، إلخ)",
												"• الحالة الحالية",
												"",
												"لوحة المحادثة:",
												"• محادثة في الوقت الفعلي بين المستخدمين وفريق الدعم",
												"• الطوابع الزمنية للرسائل",
												"• تحديد المرسل",
												"• رسائل الرد والمتابعة",
											]
										: [
												"When opening a ticket, the page is divided into two sections:",
												"",
												"Ticket Information Panel:",
												"Displays:",
												"• Ticket ID",
												"• Requested by",
												"• CC recipients",
												"• Subject",
												"• Description",
												"• Category",
												"• Priority (Low / Medium / High)",
												"• Type (Support, Inquiry, etc.)",
												"• Current status",
												"",
												"Conversation Panel:",
												"• Real-time chat between users and support team",
												"• Message timestamps",
												"• Sender identification",
												"• Reply and follow-up messages",
											],
								notices:
									language === "ar"
										? [
												"يتم حفظ سجل محادثة التذكرة بشكل دائم.",
												"يمكن فقط لمشاركي التذكرة عرض والرد.",
											]
										: [
												"Ticket chat history is saved permanently.",
												"Only ticket participants can view and reply.",
											],
							},
							{
								src: "https://i.postimg.cc/tTZv1W1t/Screenshot_2026_01_02_232049.png",
								alt: language === "ar" ? "إنشاء تذكرة جديدة (لوحة التحكم)" : "Create New Ticket (Dashboard)",
								caption: language === "ar" ? "إنشاء تذكرة جديدة" : "Create New Ticket",
								stepTitle: language === "ar" ? "إنشاء تذكرة جديدة (لوحة التحكم)" : "Create New Ticket (Dashboard)",
								stepContent:
									language === "ar"
										? [
												"يمكن للمستخدمين تقديم تذكرة دعم جديدة باستخدام نموذج التذكرة الجديدة.",
												"",
												"الحقول المطلوبة:",
												"• الموضوع – عنوان قصير للمشكلة",
												"• الفئة – نوع المشكلة (مثل الشبكة، النظام، الموارد البشرية)",
												"• النوع – دعم أو استفسار",
												"• الأولوية – متوسطة (افتراضي)، عالية، أو منخفضة",
												"• الوصف – شرح مفصل للمشكلة",
												"",
												"الحقول الاختيارية:",
												"• نسخة – إضافة مستخدمين ليتم إشعارهم",
												"• المرفقات – رفع الملفات الداعمة",
												"",
												"الصيغ المدعومة:",
												"JPEG، PNG، PDF، MP4",
												"الحد الأقصى للحجم: 50 ميجابايت",
												"",
												"الإجراءات:",
												"• إرسال التذكرة",
												"• إلغاء",
											]
										: [
												"Users can submit a new support ticket using the New Ticket form.",
												"",
												"Required Fields:",
												"• Subject – Short title of the issue",
												"• Category – Type of issue (e.g., Network, System, HR)",
												"• Type – Support or inquiry",
												"• Priority – Medium (default), High, or Low",
												"• Description – Detailed explanation of the issue",
												"",
												"Optional Fields:",
												"• CC – Add users to be notified",
												"• Attachments – Upload supporting files",
												"",
												"Supported formats:",
												"JPEG, PNG, PDF, MP4",
												"Maximum size: 50 MB",
												"",
												"Actions:",
												"• Submit Ticket",
												"• Cancel",
											],
								notices:
									language === "ar"
										? [
												"استخدم مواضيع واضحة ووصفية للحل الأسرع.",
												"اختر الفئة والأولوية الصحيحة.",
												"ارفق لقطات الشاشة أو الملفات عند الضرورة.",
											]
										: [
												"Use clear and descriptive subjects for faster resolution.",
												"Choose the correct category and priority.",
												"Attach screenshots or files when necessary.",
											],
							},
							{
								src: "https://i.postimg.cc/MH1s5wmn/localhost_8081_home_chat_Id_37(Samsung_Galaxy_S8_)_(1).png",
								alt: language === "ar" ? "المساعدة والدعم على تطبيق الجوال" : "Help & Support on Mobile App",
								caption: language === "ar" ? "قائمة التذاكر" : "Tickets List",
								stepTitle: language === "ar" ? "المساعدة والدعم على تطبيق الجوال" : "Help & Support on Mobile App",
								stepContent:
									language === "ar"
										? [
												"يوفر إصدار الجوال نفس الوظائف في تخطيط مبسط وسهل الاستخدام باللمس.",
												"",
												"قائمة التذاكر (الجوال):",
												"تعرض شاشة تذاكر الجوال:",
												"• موضوع التذكرة",
												"• وقت آخر تحديث",
												"• حالة التذكرة",
												"• مؤشر الفئة",
												"",
												"يمكن للمستخدمين:",
												"• عرض تذاكرهم",
												"• فتح محادثات التذاكر",
												"• إنشاء تذاكر جديدة",
												"",
												"إنشاء تذكرة جديدة (الجوال):",
												"تسمح شاشة التذكرة الجديدة للمستخدمين بتقديم التذاكر من هواتفهم.",
												"",
												"الحقول:",
												"• الموضوع",
												"• الفئة",
												"• الوصف",
												"• إرفاق المستندات",
												"",
												"رفع الملفات:",
												"• اختر الملفات من الجهاز",
												"• السحب والإفلات مدعوم (حيثما ينطبق)",
												"",
												"الإجراءات:",
												"• إرسال التذكرة",
												"• إلغاء",
												"",
												"محادثة التذكرة (الجوال):",
												"بمجرد إنشاء تذكرة:",
												"• يتم فتح سلسلة محادثة تلقائياً",
												"• يمكن للمستخدمين إرسال رسائل نصية",
												"• تتزامن الرسائل فوراً مع لوحة التحكم",
											]
										: [
												"The mobile version provides the same functionality in a simplified, touch-friendly layout.",
												"",
												"Tickets List (Mobile):",
												"The mobile tickets screen displays:",
												"• Ticket subject",
												"• Last update time",
												"• Ticket status",
												"• Category indicator",
												"",
												"Users can:",
												"• View their tickets",
												"• Open ticket conversations",
												"• Create new tickets",
												"",
												"Create New Ticket (Mobile):",
												"The New Ticket screen allows users to submit tickets from their phone.",
												"",
												"Fields:",
												"• Subject",
												"• Category",
												"• Description",
												"• Attach Documents",
												"",
												"File Upload:",
												"• Choose files from the device",
												"• Drag & drop supported (where applicable)",
												"",
												"Actions:",
												"• Submit Ticket",
												"• Cancel",
												"",
												"Ticket Chat (Mobile):",
												"Once a ticket is created:",
												"• A chat thread is automatically opened",
												"• Users can send text messages",
												"• Messages sync instantly with the dashboard",
											],
								notices:
									language === "ar"
										? [
												"الرسائل المرسلة من الجوال تظهر فوراً على لوحة التحكم",
												"تحدث تحديثات حالة التذكرة في الوقت الفعلي",
												"",
												"تدفق حالة التذكرة:",
												"• مفتوح – تم تقديم التذكرة",
												"• قيد المعالجة – يتم التعامل معها من قبل الدعم",
												"• تم الحل – تم حل المشكلة وإغلاقها",
												"",
												"أفضل الممارسات والملاحظات:",
												"• استخدم مواضيع واضحة ووصفية للحل الأسرع",
												"• اختر الفئة والأولوية الصحيحة",
												"• أرفق لقطات الشاشة أو الملفات عند الضرورة",
												"• استخدم محادثة التذكرة للمتابعة بدلاً من إنشاء تذاكر جديدة",
												"• راقب حالة التذكرة بانتظام",
											]
										: [
												"Messages sent from mobile appear immediately on the dashboard",
												"Ticket status updates in real time",
												"",
												"Ticket Status Flow:",
												"• Open – Ticket submitted",
												"• In Progress – Being handled by support",
												"• Resolved – Issue resolved and closed",
												"",
												"Best Practices & Notes:",
												"• Use clear and descriptive subjects for faster resolution",
												"• Choose the correct category and priority",
												"• Attach screenshots or files when necessary",
												"• Use the ticket chat for follow-ups instead of creating new tickets",
												"• Monitor ticket status regularly",
											],
							},
						],
			},
		},
	];

	return (
		<DocumentationPage
			tabs={documentationTabs}
			title={language === "ar" ? "التوثيق" : "Documentation"}
			description={
				language === "ar"
					? "دليل شامل لاستخدام النظام"
					: "Complete guide to using the system"
			}
		/>
	);
}

export default DocumentationPageView;
