const path = require("node:path");

module.exports= {
  options: {
    uploadfs: {
      storage: "local",
      uploadsPath: path.resolve(process.env.APOS_ROOT_DIR, "./public/uploads"),
    }
  }
};
