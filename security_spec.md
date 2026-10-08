# Security Specification — FUNDORA Step 19

## 1. System Overview & Core Architecture
FUNDORA connects students, researchers, startups, and social impact innovators with verified institutional funding opportunities (grants, scholarships, fellowships, competitions).
The data architecture consists of seven primary Firestore collections:
- `users`: User identity records mapped 1:1 with Firebase Authentication UIDs.
- `funding_opportunities`: Public funding records verified by administrators.
- `saved_opportunities`: Private user bookmarks mapping user UIDs to opportunity IDs.
- `applications`: Private user grant application workspaces.
- `notifications`: User-specific in-app deadline and recommendation notifications.
- `categories`: Public directory taxonomies and metadata.
- `affiliate_offers`: Public vetted affiliate partner resources.

---

## 2. Access Matrix

| Collection Path | Read Access | Create Access | Update Access | Delete Access |
|---|---|---|---|---|
| `/users/{userId}` | Owner (`auth.uid == userId`) OR Admin | Owner (`auth.uid == userId`) | Owner (`auth.uid == userId`, cannot self-elevate role) OR Admin | Admin only |
| `/funding_opportunities/{opportunityId}` | Public (`true`) | Admin only | Admin only | Admin only |
| `/saved_opportunities/{savedId}` | Owner (`auth.uid == resource.data.userId`) | Owner (`auth.uid == request.resource.data.userId`) | Owner (`auth.uid == resource.data.userId`) | Owner (`auth.uid == resource.data.userId`) |
| `/applications/{applicationId}` | Owner (`auth.uid == resource.data.userId`) OR Admin | Owner (`auth.uid == request.resource.data.userId`) | Owner (`auth.uid == resource.data.userId`) OR Admin | Owner (`auth.uid == resource.data.userId`) OR Admin |
| `/notifications/{notificationId}` | Owner (`auth.uid == resource.data.userId`) OR Admin | Owner OR Admin | Owner (`auth.uid == resource.data.userId`) | Owner (`auth.uid == resource.data.userId`) |
| `/categories/{categoryId}` | Public (`true`) | Admin only | Admin only | Admin only |
| `/affiliate_offers/{offerId}` | Public (`true`) | Admin only | Admin only | Admin only |

---

## 3. Data Invariants & Boundary Limits
1. **User Role Integrity**: Normal users cannot modify their `role` to `admin` or `superAdmin`.
2. **Catalog Immutability**: Public users cannot create, edit, or delete any document in `funding_opportunities`, `categories`, or `affiliate_offers`.
3. **Saved Opportunities Isolation**: A user cannot query or view another user's saved opportunities. Every write must have `request.resource.data.userId == request.auth.uid`.
4. **Document ID Binding**: User profiles must be keyed to their Firebase Auth UID (`/users/{auth.uid}`).
5. **String Bounds & Required Fields**:
   - `funding_opportunities`: Must contain `title`, `provider`, `fundingType`, `category`, `status`, and `deadline`. Status must be one of `Open`, `Verifying`, `Expired`.
   - `saved_opportunities`: Must contain `userId` and `opportunityId`.

---

## 4. The "Dirty Dozen" Threat Payloads (Negative Tests)
1. **Unauthenticated Write to Catalog**: Anonymous user attempts to `setDoc(/funding_opportunities/fake-grant)`. Expected: `PERMISSION_DENIED`.
2. **Regular User Editing Grant**: Authenticated user with `role: 'user'` attempts to update `/funding_opportunities/opp-1`. Expected: `PERMISSION_DENIED`.
3. **Privilege Escalation**: Authenticated user attempts `updateDoc(/users/{uid}, { role: 'superAdmin' })`. Expected: `PERMISSION_DENIED`.
4. **Cross-User Profile Hijack**: User A attempts to write to `/users/{userB_uid}`. Expected: `PERMISSION_DENIED`.
5. **Cross-User Bookmark Snooping**: User A queries `/saved_opportunities` with `where('userId', '==', userB_uid)`. Expected: `PERMISSION_DENIED`.
6. **Malicious Bookmark Insertion**: User A attempts to insert a bookmark with `userId: userB_uid`. Expected: `PERMISSION_DENIED`.
7. **Cross-User Bookmark Deletion**: User A attempts to delete `/saved_opportunities/{userB_savedId}`. Expected: `PERMISSION_DENIED`.
8. **Application Tampering**: User A attempts to read `/applications/{userB_applicationId}`. Expected: `PERMISSION_DENIED`.
9. **Fake Category Injection**: Unauthenticated or regular user attempts to write to `/categories/spam-category`. Expected: `PERMISSION_DENIED`.
10. **Affiliate Link Hijacking**: Regular user attempts to edit `/affiliate_offers/{offerId}` with a malicious redirect. Expected: `PERMISSION_DENIED`.
11. **Direct Notification Spoofing**: User A creates a notification targeted at user B without admin privileges. Expected: `PERMISSION_DENIED`.
12. **Malformed Opportunity Status**: Admin or attacker attempts to set `status: 'Approved'` instead of `Open`, `Verifying`, or `Expired`. Expected: Rejected by rules schema validator.
