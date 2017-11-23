const express = require('express');
const router = express.Router();

let Article = require('../models/article');
let User = require('../models/user');

router.get('/add', ensureAuthenticated, (req, res) =>{
    res.render("addArticle", {
        title: "Add Article"
    })
});

router.get('/:id', (req, res) => {
    Article.findById(req.params.id, (err, article) => { 
       User.findById(article.author, (err, user) => {
            res.render('article', {
                article,
                author: user.name
            });
        });
    });
});




router.post('/edit/:id', (req,res) => {
    let article = {};
    article.title = req.body.title;
    article.author = req.user._id;
    article.body = req.body.body;
    
    let query = {_id: req.params.id}

    Article.update(query, article, (err) => {
        if(err){
            console.log(err);
        } else{
            req.flash('success', 'Article Successfully updated!')
            res.redirect('/articles/'+req.params.id);
        }
    });
});


router.post('/add', (req,res) => {

    req.checkBody('title', 'Title is required').notEmpty();
   // req.checkBody('author', 'Author is required').notEmpty();
    req.checkBody('body', 'A Body is required').notEmpty();


    let errors = req.validationErrors();

    if(errors){
        res.render('addArticle', {
            title: 'Add Article',
            errors
        })
    } else{
        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;
        article.save((err) => {
            if(err){
                console.log(err);
            } else{
                req.flash('success', 'Article Added');
                res.redirect('/');
            }
        });
    }    
});

router.get('/edit/:id', ensureAuthenticated,  (req, res) => {
    Article.findById(req.params.id, (err, article) => {
        if(article.author != req.user._id){
            req.flash('danger', 'Not Authorised');
            res.redirect('/');
        } else{
            res.render('editArticle', {
                Title: "Edit Article",
                article
            });
        }
    });
});


router.delete('/:id', (req, res) => {

    if(!req.user._id){
        res.status(500).send();
    }

    let query = {_id: req.params.id}

    Article.findById(req.params.id, (err, article) => {
        if(article.author != req.user._id){
            res.status(500).send();
        } else{
            Article.remove(query, (err) =>{
                if(err){
                    console.log(err);
                } else{
                    res.send('Success!');
                }
            });
        }
    });
});

function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next();
    } else {
        req.flash('danger', 'Please Login');
        res.redirect('/users/login');
    }
}

module.exports = router;