# API Routes & RBAC

This file lists all API routes discovered in the repository and the required protections (auth / RBAC). The `Source` column links to the route file.

| Method | Path | Auth required | Allowed roles | Mounted prefix / Notes | Source |
|---|---|---:|---|---|---|
| GET | / | No | - | Server root health | [server/server.js](server/server.js#L1) |

<!-- /api/auth -->
| POST | /api/auth/login | No | - | Auth login | [server/routes/authRoutes.js](server/routes/authRoutes.js#L1) |
| GET | /api/auth/me | Yes | Any authenticated | Token test / current user | [server/routes/authRoutes.js](server/routes/authRoutes.js#L1) |

<!-- /api/users (router uses verifyToken) -->
| GET | /api/users/profile | Yes | Any authenticated | User profile | [server/routes/userRoutes.js](server/routes/userRoutes.js#L1) |
| PUT | /api/users/profile | Yes | Any authenticated | Update profile | [server/routes/userRoutes.js](server/routes/userRoutes.js#L1) |
| GET | /api/users/asdos-dashboard | Yes | Any authenticated | Asdos dashboard data | [server/routes/userRoutes.js](server/routes/userRoutes.js#L1) |
| GET | /api/users/mahasiswa-dashboard | Yes | Any authenticated | Mahasiswa dashboard data | [server/routes/userRoutes.js](server/routes/userRoutes.js#L1) |
| GET | /api/users/admin/users/:id | Yes (no RBAC enforced) | Intended: admin | Admin: get user details — role-check commented out in code | [server/routes/userRoutes.js](server/routes/userRoutes.js#L1) |
| PUT | /api/users/admin/users/:id | Yes (no RBAC enforced) | Intended: admin | Admin: update user — role-check commented out in code | [server/routes/userRoutes.js](server/routes/userRoutes.js#L1) |
| POST | /api/users/admin/enroll | Yes (no RBAC enforced) | Intended: admin | Assign user to class — role-check commented out in code | [server/routes/userRoutes.js](server/routes/userRoutes.js#L1) |
| POST | /api/users/admin/unenroll | Yes (no RBAC enforced) | Intended: admin | Remove user from class — role-check commented out in code | [server/routes/userRoutes.js](server/routes/userRoutes.js#L1) |

<!-- /api/admin -->
| GET | /api/admin/stats | Yes | admin | Dashboard stats | [server/routes/adminRoutes.js](server/routes/adminRoutes.js#L1) |
| GET | /api/admin/asdos | Yes | admin | List asdos (query: id_praktikum) | [server/routes/adminRoutes.js](server/routes/adminRoutes.js#L1) |
| POST | /api/admin/asdos | Yes | admin | Assign asdos | [server/routes/adminRoutes.js](server/routes/adminRoutes.js#L1) |
| DELETE | /api/admin/asdos | Yes | admin | Remove asdos | [server/routes/adminRoutes.js](server/routes/adminRoutes.js#L1) |
| GET | /api/admin/users | Yes | admin | List users | [server/routes/adminRoutes.js](server/routes/adminRoutes.js#L1) |
| POST | /api/admin/users | Yes | admin | Create user | [server/routes/adminRoutes.js](server/routes/adminRoutes.js#L1) |
| DELETE | /api/admin/users/:id | Yes | admin | Delete user | [server/routes/adminRoutes.js](server/routes/adminRoutes.js#L1) |
| GET | /api/admin/praktikum | Yes | admin | List praktikum | [server/routes/adminRoutes.js](server/routes/adminRoutes.js#L1) |
| POST | /api/admin/praktikum | No (unprotected in code) | Intended: admin | Create class + auto-generate sessions — MISSING `verifyToken`/RBAC in code | [server/routes/adminRoutes.js](server/routes/adminRoutes.js#L1) |
| DELETE | /api/admin/praktikum/:id | Yes | admin | Delete class | [server/routes/adminRoutes.js](server/routes/adminRoutes.js#L1) |

<!-- /api/content (router uses verifyToken) -->
| POST | /api/content/session | Yes | asdos, admin | Create session | [server/routes/contentRoutes.js](server/routes/contentRoutes.js#L1) |
| GET | /api/content/session/list/:id_praktikum | Yes | Any authenticated | List sessions by class | [server/routes/contentRoutes.js](server/routes/contentRoutes.js#L1) |
| PUT | /api/content/session/:id | Yes | asdos, admin | Update / reschedule session | [server/routes/contentRoutes.js](server/routes/contentRoutes.js#L1) |
| DELETE | /api/content/session/:id | Yes | asdos, admin | Delete session | [server/routes/contentRoutes.js](server/routes/contentRoutes.js#L1) |
| POST | /api/content/materi | Yes | asdos, admin | Upload material (multipart) | [server/routes/contentRoutes.js](server/routes/contentRoutes.js#L1) |
| POST | /api/content/tugas | Yes | asdos, admin | Create task (multipart) | [server/routes/contentRoutes.js](server/routes/contentRoutes.js#L1) |
| GET | /api/content/materi/session/:pertemuan_id | Yes | Any authenticated | Materials by session | [server/routes/contentRoutes.js](server/routes/contentRoutes.js#L1) |
| GET | /api/content/tugas/session/:pertemuan_id | Yes | Any authenticated | Tasks by session | [server/routes/contentRoutes.js](server/routes/contentRoutes.js#L1) |
| GET | /api/content/materi/:materiId/download/:fileIndex | Yes | Any authenticated | Download material file | [server/routes/contentRoutes.js](server/routes/contentRoutes.js#L1) |
| GET | /api/content/tugas/:id/download/:index | Yes | Any authenticated | Download task attachment | [server/routes/contentRoutes.js](server/routes/contentRoutes.js#L1) |
| GET | /api/content/tugas/:id | Yes | Any authenticated | Get task by id | [server/routes/contentRoutes.js](server/routes/contentRoutes.js#L1) |
| GET | /api/content/me/:taskId | Yes | Any authenticated | Get my submission (via submissionController) | [server/routes/contentRoutes.js](server/routes/contentRoutes.js#L1) |
| GET | /api/content/session/:id | Yes | Any authenticated | Get session by id | [server/routes/contentRoutes.js](server/routes/contentRoutes.js#L1) |

<!-- /api/submission (router uses verifyToken) -->
| POST | /api/submission/ | Yes | Any authenticated | Submit work (file upload) | [server/routes/submissionRoutes.js](server/routes/submissionRoutes.js#L1) |
| PUT | /api/submission/:submissionId/grade | Yes | asdos, admin | Grade a submission | [server/routes/submissionRoutes.js](server/routes/submissionRoutes.js#L1) |
| GET | /api/submission/:submissionId/download | Yes | Any authenticated (controller checks ownership) | Download submitted file | [server/routes/submissionRoutes.js](server/routes/submissionRoutes.js#L1) |
| GET | /api/submission/task/:taskId | Yes | asdos, admin | Get all submissions for a task | [server/routes/submissionRoutes.js](server/routes/submissionRoutes.js#L1) |
| GET | /api/submission/me/:taskId | Yes | Any authenticated | Get my submission for a task | [server/routes/submissionRoutes.js](server/routes/submissionRoutes.js#L1) |
| POST | /api/submission/me/bulk-check | Yes | Any authenticated | Bulk fetch my submissions for tasks | [server/routes/submissionRoutes.js](server/routes/submissionRoutes.js#L1) |
| GET | /api/submission/download/:submissionId | Yes | Any authenticated | Duplicate download route (alias) | [server/routes/submissionRoutes.js](server/routes/submissionRoutes.js#L1) |