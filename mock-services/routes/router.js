const router = require('express').Router();
const httpGetController = require('../controller/http/get');
const httpPostController = require('../controller/http/post');
const httpPutController = require('../controller/http/put');
const httpPatchController = require('../controller/http/patch');
const httpDeleteController = require('../controller/http/delete');
const rateLimit = require('./rate-limit');

router.get('/get/:projectId/:version/:endpoint', httpGetController);
router.get('/get/:projectId/:version/:endpoint/:recordId', httpGetController);
router.post('/post/:projectId/:version/:endpoint', rateLimit.writeLimit, httpPostController);
router.put('/put/:projectId/:version/:endpoint/:recordId', rateLimit.writeLimit, httpPutController);
router.patch('/patch/:projectId/:version/:endpoint/:recordId', rateLimit.writeLimit, httpPatchController);
router.delete('/delete/:projectId/:version/:endpoint/:recordId', httpDeleteController);

module.exports = router;