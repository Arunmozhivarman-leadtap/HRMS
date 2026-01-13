# Settings Module (Focused - Navigation & Integration)

**Module Purpose**  

The Settings page serves as the central hub for system-wide and operational configurations.  

Existing pages for Leave Policies, Public Holiday Calendar are **already implemented** — they should **not** be recreated or modified here.  

Instead, link to them as **submenus / subsections** under the main Settings navigation.  

New integrations in this file:  

- Company Settings (Section 6.1)  

- Master Data Management (Departments, Designations, Office Locations, etc.)

All UI/UX must match the style of the `/employees` pages (large search inputs, data tables, tabbed , role-based conditional rendering, mobile-responsive).

**Important Constraints**  



- Only implement Company Settings and Master Data sections.  

- Strict role-based access (Super Admin full; HR Admin limited; Manager/Employee no access).  

- Every change must trigger audit logging.  

- Follow gemini.md guidelines (validation, no magic numbers, secure defaults, India-first where applicable).

## 1. Navigation Structure (Settings Sidebar / Top Nav)

Main Settings entry in dashboard sidebar/top nav → opens the Settings dashboard with the following structure:

- **Company Settings**     (new – implement this)  

- **Master Data**          (new – implement this)  

- **Leave Policies**       → link to existing page  



Use the same navigation pattern as `/employees` (collapsible sidebar or tabs/accordion on mobile).

## 2. Role-Based Access Control (RBAC)

| Section / Action                | Super Admin | HR Admin          | Manager | Employee | Candidate |

|---------------------------------|-------------|-------------------|---------|----------|-----------|

| Access Settings Page            | ✓ Full     | ✓ (Limited)       | ✗       | ✗        | ✗         |

| View Company Settings           | ✓          | ✓                 | ✗       | ✗        | ✗         |

| Edit Company Settings           | ✓          | ✗                 | ✗       | ✗        | ✗         |

| View Master Data                | ✓          | ✓                 | ✗       | ✗        | ✗         |

| Edit Master Data                | ✓          | ✓                 | ✗       | ✗        | ✗         |

| View Leave Policies             | ✓          | ✓                 | ✗       | ✗        | ✗         |

| Edit Leave Policies             | ✓          | ✓                 | ✗       | ✗        | ✗         |



**Routing Rules**  

- Manager / Employee should not see settings nav

- Use same role context/store as `/employees` pages.

## 3. Company Settings (New Section)

**Fields from Section 6.1** (implement as a form page):

| Field                        | Type          | Validation / Notes                                  | Editable By     | UI Element                     |

|------------------------------|---------------|-----------------------------------------------------|-----------------|--------------------------------|

| Company Name                 | Text          | Required                                            | Super Admin     | Input                          |

| Trading Name                 | Text          | Optional                                            | Super Admin     | Input                          |

| Registration Number (CIN/LLP)| Text          | Format validation                                   | Super Admin     | Input                          |

| GST Number                   | Text          | GSTIN format                                        | Super Admin     | Input                          |

| PAN Number                   | Text          | PAN format, masked display                          | Super Admin     | Input (masked)                 |

| PF Registration (EPFO code)  | Text          | Format validation                                   | Super Admin     | Input                          |

| ESI Registration (ESIC code) | Text          | Format validation                                   | Super Admin     | Input                          |

| Registered Address           | Textarea      | Multi-line                                          | Super Admin     | Textarea                       |



| Logo                         | Image Upload  | JPG/PNG, <2MB, preview                              | Super Admin     | Uploader + preview             |

| Letterhead                   | Image/PDF     | For official documents, preview                     | Super Admin     | Uploader + preview             |


Save button → audit log entry on success.

## 4. Master Data Management (New Section)

**CRUD tables** for dropdown masters used across system:

| Master List          | Fields                              | Editable By          | UI Pattern (like Employees)         |

|----------------------|-------------------------------------|----------------------|-------------------------------------|

| Departments          | Name, Description, Head (optional)  | Super Admin + HR     | DataTable + add/edit modals         |

| Designations         | Name, Level/Grade (optional)        | Super Admin + HR     | DataTable + add/edit modals         |

| Office Locations     | Name, Address, State, City          | Super Admin + HR     | DataTable + add/edit modals         |

| Employment Types     | Full-time, Part-time, Contract, Intern | Super Admin + HR  | Simple list + add/edit              |

| Referral Sources     | Job Portal, Referral, Direct, Agency | Super Admin + HR   | Simple list + add/edit              |

**UI Pattern**: Same DataTable component as employee list (searchable, paginated, filters, add/edit/delete buttons).  


## 5. UI/UX Guidelines (Must Match /employees Pages)



- Data tables: sortable, filterable, pagination.  

- Forms: grouped sections, real-time validation, save/cancel.  

- Modals: consistent add/edit style from employees.  

- Mobile: accordion collapse for sections, responsive tables.  


## 6. Security & Compliance Rules

- **Audit Logging**: Every change (company or master data) must log to existing audit system.  

- **Validation**: Follow spec formats (GSTIN, PAN, etc.), no magic numbers.  

- **403 Handling**: Clear message + redirect if unauthorized.  

- **PII**: PAN/ESI/PF fields masked in UI/logs except Super Admin.

## 7. Integration Points

- Company logo/letterhead used in offer letters, experience certificates, etc.  

- Office locations populate in onboarding and employee creation dropdowns.  

- Master data (departments, designations) used in employee forms and reports.  

- No new integration needed for leave/holiday/ — just navigation links.

**Last Updated:** January 13, 2026  

**Related Documents:** hr-system-specification-Version_2.0.md, gemini.md, employee-module.md (UI reference)