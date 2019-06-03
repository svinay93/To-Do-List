//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const mongoose= require("mongoose");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-sunil:*******@cluster0-lhxxz.mongodb.net/todolistDB",{useNewUrlParser:true});

const itemSchema = {
  name : String
};
const Item = mongoose.model("item",itemSchema);
const item1 = new Item({
  name: "Welcome to Todod List"
});
const item2 = new Item({
  name: "Hit + to add new item"
});
const item3 = new Item({
  name: "Check <-- to delete an item"
});

const defaultArray = [item1,item2,item3];
const listSchema = {
  name : String,
  lists:[itemSchema]
};
const List = mongoose.model("List",listSchema);


const workItems = [];

app.get("/", function(req, res) {

  Item.find({},function(err,itemsjson){
    if(err){
      console.log(err);
    }
    else{
        if(itemsjson.length===0){
          Item.insertMany(defaultArray,function(err){
            if(err){
              console.log(err);
            }
          });
        res.redirect("/");
        }
        else{
          res.render("list", {listTitle: "Today", newListItems: itemsjson});
        }


    }
  });
});

app.post("/", function(req, res){

  const boditem = req.body.newItem;

  const newItem = new Item({
    name:boditem
  });
  if(req.body.list==="Today"){
    newItem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:req.body.list},function(err,result){
      if(!err){
        result.lists.push(newItem);
        result.save();
        res.redirect("/"+result.name);
      }
    })
  }

});
app.post("/delete",function(req,res){
  const id= req.body.checkBox;
  const headTitle= req.body.listHeading;
  if(headTitle==="Today"){
    Item.deleteOne({_id:req.body.checkBox},function(err){
      if(err){
        console.log(err);
      }
      else{
        res.redirect("/");

      }
    })
  }
  else{
    List.findOneAndUpdate({name:headTitle},{$pull:{lists:{_id:id}}},function(err,result){
      if(!err){
        res.redirect("/"+headTitle);
      }
    })
  }
});
app.get("/:customList", function(req,res){
  const newListHead= _.capitalize(req.params.customList);
  List.findOne({name:newListHead},function(err,result){
    if(!err){
      if(result===null){
        const newListPage = new List({
          name:newListHead,
          lists:defaultArray
        });
        newListPage.save();
        const urllocal ="/"+newListHead;
        res.redirect(urllocal);
      }
      else{
        res.render("list", {listTitle: result.name, newListItems: result.lists});
      }

    }

  });
  // const newListPage = new List({
  //   name:req.params.customList,
  //   lists:defaultArray
  // });
  // newListPage.save();
  });

app.get("/about", function(req, res){
  res.render("about");
});
let port = process.env.PORT;
if(port == null || port == "" ){
  port=3000;
}
app.listen(port, function() {
  console.log("Server started successfully");
});
