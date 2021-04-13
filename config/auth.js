module.exports = {
    ensureAuthenticated : function(req,res,next) {
        if(!req.session.passport) {
            req.session.destroy()
            res.redirect('/login');
        }
        if(req.session.passport) {
            return next();
        }
        req.flash('error_msg' , 'please login to continue');
        res.redirect('/login');
    }
}