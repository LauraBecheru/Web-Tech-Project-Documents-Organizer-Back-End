const express = require('express')
const bodyParser = require('body-parser')
const Sequelize = require('sequelize')

const sequelize = new Sequelize('documents_organizer','root','',{
	dialect : 'mysql',
	define : {
		timestamps : false
	}
})

const Category = sequelize.define('category', {
	name : {
		type : Sequelize.STRING,
	},
})

const Document = sequelize.define('document', {
    registrationId : {
      type : Sequelize.STRING,
      allowNull : false,
    },
    name : {
      type : Sequelize.STRING,
      allowNull : false,
    },
    type : {
      type : Sequelize.STRING,
      allowNull : false,
    }
  });
  Category.hasMany(Document);

const app = express()
app.use(bodyParser.json())

app.get('/create', (req, res, next) => {
    sequelize.sync({force : true})
      .then(() => res.status(201).send('Database Created'))
      .catch((error) => next(error))
  });
  
  
  //CATEGORY
  app.get('/category', (req, res, next) => {
    Category.findAll()
      .then((categories) => res.status(200).json(categories))
      .catch((error) => next(error))
})

app.post('/category', (req, res, next) => {
  Category.create(req.body)
    .then(() => res.status(201).send('Category Created'))
    
})

app.get('/category/:id', (req, res, next) => {
  Category.findById(req.params.id, {include : [Document]})
    .then((category) => {
      if (category){
        res.status(200).json(category)
      }
      else{
        res.status(404).send('not found')
      }
    })
    .catch((error) => next(error))
})

app.put('/category/:id', (req, res, next) => {
  Category.findById(req.params.id)
    .then((category) => {
      if (category){
        return category.update(req.body, {fields : ['name']})
      }
      else{
        res.status(404).send('Not found')
      }
    })
    .then(() => {
      if (!res.headersSent){
        res.status(201).send('Category modified')  
      }
    })
    .catch((error) => next(error))
})
  
  app.delete('/category/:id', (req, res, next) => {
  Category.findById(req.params.id)
    .then((category) => {
      if (category){
        return category.destroy()
      }
      else{
        res.status(404).send('Not found')
      }
    })
    .then(() => {
      if (!res.headersSent){
        res.status(201).send('Category modified')  
      }
    })
    .catch((error) => next(error))
})

//DOC

app.get('/category/:cid/document/', (req, res, next) => {
  Category.findById(req.params.cid)
    .then((category) => {
      if (category){
        return category.getDocuments()
      }
      else{
        res.status(404).send('not found')
      }
    })
    .then((doc) => {
      if (!res.headersSent){
        res.status(200).json(doc)  
      }
    })
    .catch((error) => next(error))  
})

app.post('/category/:cid/document', (req, res, next) => {
  Category.findById(req.params.cid)
    .then((category) => {
      if (category){
        let doc = req.body
        doc.category_id = category.id
        return Document.create(doc)
      }
      else{
        res.status(404).send('not found')
      }
    })
    .then((doc) => {
      if (!res.headersSent){
        res.status(201).send('Document created')  
      }
    })
    .catch((error) => next(error))  

})

app.get('/category/:cid/document/:did', (req, res, next) => {
  Document.findById(req.params.did)
    .then((doc) => {
      if (doc){
        res.status(200).json(doc)
      }
      else{
        res.status(404).send('not found')
      }
    })
    .catch((error) => next(error))
})

app.put('/category/:cid/document/:did', (req, res, next) => {
  Document.findById(req.params.did)
    .then((doc) => {
      if (doc){
        return doc.update(req.body, {fields : ['registrationId', 'name','type']})
      }
      else{
        res.status(404).send('not found')
      }
    })
    .then(() => {
      if (!res.headersSent){
        res.status(201).send('Document modified')  
      }
    })
    .catch((error) => next(error))  
})


app.delete('/category/:cid/document/:did', (req, res, next) => {
  Document.findById(req.params.did)
    .then((doc) => {
      if (doc){
        return doc.destroy()
      }
      else{
        res.status(404).send('not found')
      }
    })
    .then(() => {
      if (!res.headersSent){
        res.status(201).send('Document removed')
      }
    })
    .catch((error) => next(error))
})

  app.use((err, req, res, next) => {
  console.warn(err)
  res.status(500).send('Smth went wrong')
})

  app.listen(8080)
