const util = require('util');
const child = require('child_process');
const path = require('path');
const fs = require('fs/promises');
const exec = util.promisify(child.exec);

async function createCert() {
    const certsPath = path.join(__dirname, '../certs');

    const privateKeyPath = path.join(certsPath, 'privatekey.pem');
    await fs.readFile(privateKeyPath).catch(() => {
        console.log("Generating private key");
        return exec(`openssl genrsa -out ${privateKeyPath} 2048`);
    });

    const csrPath = path.join(certsPath, 'certrequest.csr');
    await fs.readFile(csrPath).catch(() => {
        console.log("Generating CSR");
        return exec(`openssl req -new -key ${privateKeyPath} -out ${csrPath} -subj '/C=NL/ST=NA/L=NA/O=OpenStad/OU=OpenStad/CN=openstad.${process.env.AUTH_DOMAIN}'`)
    });

    const publicKeyPath = path.join(certsPath, 'certificate.pem');
    await fs.readFile(publicKeyPath).catch(() => {
        console.log("Generating public key");
        return exec(`openssl x509 -req -in ${csrPath} -signkey ${privateKeyPath} -out ${publicKeyPath}`)
    })
}

createCert()
