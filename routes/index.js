
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('views/index.html', { title: 'Rec.All' , phone_number: '+1 623-552-4233'});
};
