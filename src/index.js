const { UploadClient } = require('@uploadcare/upload-client');
const  { generateSecureSignature } = require('@uploadcare/signed-uploads');

const stream = require("stream");
const fs = require("fs");
 
 
var concat = require('concat-stream')
let client = null;
const fUpload = async(file)=>{
  console.log("upload non buffer",file)
  
 
}

const  {
  deleteFile,
  UploadcareSimpleAuthSchema,
} = require('@uploadcare/rest-client');

module.exports = {
    init(providerOptions) {
      // init your provider if necessary
      client = new UploadClient({ publicKey: providerOptions.public_key })
      const BASE_CDN_URL = providerOptions.base_cdn_url;
      const uploadcareSimpleAuthSchema = new UploadcareSimpleAuthSchema({
        publicKey: providerOptions.public_key ,
        secretKey: providerOptions.secret_key ,
      });
      
      
      return {
        async upload(file) {
          // upload the file in the provider
          // file content is accessible by `file.buffer`
          let fileReturn = await client.uploadFile(file.buffer,{fileName:file.name,contentType:file.mime});
            console.log(fileReturn.uuid) ;
            file.url = `${BASE_CDN_URL}/${fileReturn.uuid}/`;

        },
        async uploadStream(file) {
          // upload the file in the provider
          // file content is accessible by `file.stream`
          if (!file.stream) {
            return Promise.reject(new Error("Missing file stream"));
          }
       
          const { stream: stream$1 } = file;
          return new Promise((resolve, reject) => {
        
            stream$1.pipe(concat(async (buffer)=>{
              console.log("Uploading")
              let fileReturn = await client.uploadFile(buffer,{fileName:file.name,contentType:file.mime});
              file.url = `${BASE_CDN_URL}/${fileReturn.uuid}/`;
               
              resolve();
            }));
          });

        },
        async delete(file) {
          // delete the file in the provider
          //client.delete()
          console.log("Delete ",file.url.split("/").reverse()[1],file.url)
          const result = await deleteFile(
            {
              uuid: file.url.split("/").reverse()[1],
            },
            { authSchema: uploadcareSimpleAuthSchema }
          )
          console.log("requested delete!",result);
        },
 
        async getSignedUrl(file) {

            const { secureSignature, secureExpire } = generateSecureSignature(providerOptions.secret_key, {
                expire: Date.now() + 60 * 30 * 1000 // expire in 30 minutes
              })
              // const SignedClient = new UploadClient({ publicKey: providerOptions.public_key,secureSignature, secureExpire })
              
              let fileReturn = await client.uploadFile(file.buffer,secureSignature,secureExpire  );
              console.log(fileReturn.uuid) ;
              file.url = `${BASE_CDN_URL}/${fileReturn.uuid}/`;
        },
    
      };
    },
  };