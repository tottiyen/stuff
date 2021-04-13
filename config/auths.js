module.exports = {
    ensureAuthenticate : function(req,res,next) {
        if(req.session.passport) {
            res.redirect('/')
        }
        if(!req.session.passport) {
            req.session.destroy()
            return next();
        }
        req.flash('error_msg' , 'please login to continue');
        res.redirect('/');
    }
}