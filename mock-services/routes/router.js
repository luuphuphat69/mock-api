const router = require('express').Router();
const httpGetController = require('../controller/http/get');
const httpPostController = require('../controller/http/post');
const httpPutController = require('../controller/http/put');
const httpPatchController = require('../controller/http/patch');
const httpDeleteController = require('../controller/http/delete');

router.get('/get/:projectId/:version/:endpoint', httpGetController);
router.get('/get/:projectId/:version/:endpoint/:recordId', httpGetController);
router.post('/post/:projectId/:version/:endpoint', httpPostController);
router.put('/put/:projectId/:version/:endpoint/:recordId', httpPutController);
router.patch('/patch/:projectId/:version/:endpoint/:recordId', httpPatchController);
router.delete('/delete/:projectId/:version/:endpoint/:recordId', httpDeleteController);

module.exports = router;