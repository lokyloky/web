var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

let items = [
    {id:1, nom:'nombre' , rol:'rol1'},
    {id:2, nom:'nombre2', rol:'rol2'},
    {id:3, nom:'nombre3', rol:'rol3'},
]


function findItem(id){
    for (let i = 0; i < items.length ; i++) {

        if (items[i].id == id){
            return i
        }
    }
    return -1;
}


// API ///////////////////////

// Show ALL items
app.get('/api/items', (req, res) => {
    res.status(200).send(items)
});

// ITEMS DETAIL
app.get('/api/items/:id', (req, res)=>{
    const id = parseInt(req.params.id)
    console.log(typeof (id))

    let item = null
    for (let i = 0; i < items.length  ; i++) {
        if (items[i].id == id){
            item = items[i]
            break
        }
    }

    if (!item){
        res.status(404).json(' Item ' + id + ' not found')
    }else{
        res.status(200).json(item)
    }

});

function findItemByIndex(id){
    for (let i = 0; i < items.length ; i++) {
        if (items[i].id == id){
            return i
        }
    }
    return -1
}

// update a SINGLE item
app.post("/items/update", (req, res)=>{
    //destructuring
    let {id, nom, rol } = req.body;

    let foundIndex = findItem(id);
    // if error show msg
    //update DB / file


    items[foundIndex].nom= nom
    items[foundIndex].rol = rol
    // items[foundIndex] = {id, nom, rol }

    res.redirect('/items')

});

// Delete item by id
app.delete('/api/items/:id', (req, res)=>{
    const id = parseInt(req.params.id)

    let foundIndex = findItem(id)

    if (foundIndex == -1){ // si no encontrado
        res.status(404).send('not found')
    }else {
        items.splice(foundIndex,1)
        res.status(204).send()
    }
})

// Insert item
app.post('/api/items',(req, res)=>{
    let params = req.body
    params.id = items.length +1
    items.push(params) // DB.insert(...)
    res.status(201).json(params)
})



// WEB //////////////////////////////////////

// INDEX
app.get('/', (req, res) => {
    res.render('index',{title:'WEB DE ITEMS'})
});

// Show ALL Items
app.get('/items', (req, res) => {
    res.render('items',
        {
            title:'ITEMS',
            items:items    }
    )
})

// INSERT ITEM GET: show form
app.get('/items/insert', (req,res)=>{
    res.render('insert_item',
        {title:'insert item'}
    )
});
// INSERT ITEM POST: get params and do your mojo!
app.post('/items',(req, res)=>{
    const params = req.body
    params.id = items.length +1
    items.push(params) // DB.insert(...)
    res.redirect('/items')
});

// UPDATE ITEM
app.get('/items/update/:id', (req,res)=>{
    const id = req.params.id
    console.log('/items/update id:',id)

    let index =findItem(id)
    if (index == -1){
        let msg = 'Error item ' + id + ' nofound'
        res.status(404).send({msg})
    }

    let item = items[index];
    let options ={
        title:'update item',
        item:item
    }
    res.render('update_item',options)
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
