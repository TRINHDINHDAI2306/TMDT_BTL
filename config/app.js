module.exports = {

    port: 3000,
    static_folder: `${__dirname}/../src/public`,
    // router: `${__dirname}../src/routers`,
    // controller : `${__dirname}../src/controllers`,
    views_folder: `${__dirname}/../src/apps/views`,
    view_engine: "ejs",
    session_key: "vietPro",
    session_secure: false,
    tmp: `${__dirname}/../src/tmp/`,
}