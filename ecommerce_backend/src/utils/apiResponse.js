 // PUBLIC_INTERFACE
 function ok(res, data, meta) {
   /** Sends a success JSON response with optional metadata. */
   return res.status(200).json({ success: true, data, meta: meta || null });
 }

 // PUBLIC_INTERFACE
 function created(res, data) {
   /** Sends a created JSON response. */
   return res.status(201).json({ success: true, data });
 }

 // PUBLIC_INTERFACE
 function badRequest(res, message, details) {
   /** Sends a 400 response with message and optional details. */
   return res.status(400).json({ success: false, message, details: details || null });
 }

 // PUBLIC_INTERFACE
 function unauthorized(res, message = 'Unauthorized') {
   /** Sends 401 unauthorized response. */
   return res.status(401).json({ success: false, message });
 }

 // PUBLIC_INTERFACE
 function notFound(res, message = 'Not Found') {
   /** Sends 404 not found response. */
   return res.status(404).json({ success: false, message });
 }

 // PUBLIC_INTERFACE
 function serverError(res, message = 'Internal Server Error') {
   /** Sends 500 error response. */
   return res.status(500).json({ success: false, message });
 }

 module.exports = { ok, created, badRequest, unauthorized, notFound, serverError };
