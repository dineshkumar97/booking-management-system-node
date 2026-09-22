import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
    /* credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID_BMS_1,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_BMS_1
    } */
});



// aws sts get-caller-identity
// aws configure list
// bms_node_user



// | API purpose                      | CUSTOMER |   STAFF | ADMIN |
// | -------------------------------- | -------: | ------: | ----: |
// | View services                    |        ✅ | maybe ✅ |     ✅ |
// | Create appointment               |        ✅ |       ❌ | maybe |
// | View own appointments            |        ✅ |       ❌ |     ❌ |
// | View assigned staff appointments |        ❌ |       ✅ | maybe |
// | Confirm appointment              |        ❌ |       ✅ |     ❌ |
// | Reject appointment               |        ❌ |       ✅ |     ❌ |
// | Complete appointment             |        ❌ |       ✅ |     ❌ |
// | View all users                   |        ❌ |       ❌ |     ✅ |
// | Create staff                     |        ❌ |       ❌ |     ✅ |
// | Manage services                  |        ❌ |       ❌ |     ✅ |
// | View all appointments            |        ❌ |       ❌ |     ✅ |
