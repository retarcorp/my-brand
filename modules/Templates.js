Templates = {
    getRegistrationMail(user) {
        return `
            <h1 style="font-family: sans-serif; font-weight: lighter;">Hello <span style="font-weight: bold;">${user.name}</span></h1>
            
            <h2 style="font-family: sans-serif; font-weight: lighter;">Your password</h2>
            
            <p style="font-family: monospace; font-size: 24px; font-weight: bold;">${user.password}</p>
        `
    }
}

module.exports =  Templates;