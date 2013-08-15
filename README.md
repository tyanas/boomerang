#boomerang


Summerschool project - Call to the future

##Edit css

Install compass, run `compass watch` in project dir, edit `*.sass` files.
`compass` will create (or recreate) `*.css` files.
See `config.rb` for details.

##Deploy tipster

once install heroku toolbelt and (in project root dir):

    git remote add heroku git@heroku.com:.git

when master branch is "stable":

    git co production
    git merge master
    git push
    git push heroku production:master

##Quick install

 Install npm (server side) dependencies:

    $ npm install

 Start the server:

    $ node server
 
 Then open a browser and go to:
    
    http://localhost:3000
