
const express = require('express');
const app = express();
const mongoose = require('mongoose');

//change to your db account
//mongoose.connect('mongodb+srv://stu185:p440465W@cluster0.gbo7pn3.mongodb.net/stu185');
mongoose.connect('mongodb+srv://Winston:Wrz123456@cluster0.pcxsvue.mongodb.net/?retryWrites=true&w=majority');
const {ApolloServer, gql, UserInputError} = require('apollo-server-express');

const db = mongoose.connection;
var bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(cors());
app.use(bodyParser.json());
const multer = require('multer'); 
var alert = require('alert');


const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
  })

const uploads = multer({storage: storage});

const path = require('path');
const fs = require('fs-extra');

const IndexFileSchema = mongoose.Schema({
    _uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'Tester' },
    indexname: {type:String},
    indexFilename: {type:String},
    compeditorName:{type:String},
    id:{type:Number},
    time: { type: String },
    result: {type:String},
    Done: {type: Boolean},
    writeRatio: {type: String},
    Thread: {type: String},
    Latency: {type: String},
    rangeQuery: {type: Boolean},
    Zipfian: {type: Boolean},
    range: {type: String},
}); 

const TesterSchema = mongoose.Schema({
    Id: {type: Number, required: true, unique: true},
    email: {type:String, required:true},
    name: {type:String, required:true},
    pw: {type:String, required:true}
});

const Tester = mongoose.model('Tester',TesterSchema);
const IndexFile = mongoose.model('Index',IndexFileSchema);

db.on('error', console.error.bind(console, 'Connection error:'));

db.once('open',function(){
    console.log('Connecting')
    const bodyParser = require('body-parser');
    // Use parser to obtain the content in the body of a request
    app.use(bodyParser.urlencoded({ extended: false }));

    app.get('/clear',(req,res)=>{
        Tester.collection.deleteMany({});
        IndexFile.collection.deleteMany({});
        res.send('done');
    });

    app.get('/getalluser',(req,res)=>{
        res.set('Content-Type','text/plain');
        Tester.find({})
        .then((e,err)=>{
            if(err) console.log("fine "+err);
            else{
                r = "[";
                for(i of e){
                    r += "\n{\n"+'"name": "'+ i.name+'",\n'+'"email": '+i.email +'\n"password": "'+ i.pw+'",\n'+'\n},';
                }
                if(r.length>1){
                    r = r.slice(0,r.length-1);
                }
                r+=']';
                res.send(r);
            }
        })
    })

    //sign up
    app.post('/signup',(req,res) => {
        username = req.body['uploaderName'];
        email = req.body['uploaderEmail'];
        pw = req.body['password'];
        console.log("New User: " + username,email,pw);
        before = 0
        Tester.find({})
        .then((e,err)=>{
            if(err){
                before = 0;
            }
            else{
                for(i of e){
                    before +=1;
                }
            }
            Tester.findOne({email:email}).then((e,err)=>{
                if(err||e==null){
                    Tester.create({
                        Id: Number(before),
                        name:req.body['uploaderName'],
                        email:req.body['uploaderEmail'],
                        pw: req.body['password'],
                    });
                    alert("Signed up! Go back and send index file");
                    res.sendFile(__dirname+"/PostForm.html");
                }
                else{
                    console.log("This email already signed up!");
                    alert("Existed Email, Try another");
                }
            }) 
            
        })
    });


    //if user wants to see the test result before
    app.get('/lookup',(req,res)=>{
        var Email = req.query['email'];
        IndexFile.find({})
        .populate('_uploader')
        .then((e)=>{
            var head1 = "<h2>Results Uploaded by "+Email+"</h2>" + 
            '<table id="User Uploads" style="border: 1px solid;">' + 
                '<thead>' + 
                    '<tr>' + 
                        '<td style="width:20%">Index Name</td>' + 
                        '<td style="width:20%">Test Result</td>' + 
                        '<td style="width:20%">Index File</td>' +
                        '<td style="width:20%">Time(YYYY-MM-DD_HH-mm)</td>' +
                    '</tr>'+
                '</thead>';
            var head2 = "<h2>Other Uploads:</h2>" + 
            '<table id="User Uploads" style="border: 1px solid;">' + 
                '<thead>' + 
                    '<tr>' + 
                        '<td style="width:20%">Index Name</td>' + 
                        '<td style="width:20%">Email</td>' + 
                        '<td style="width:20%">Test Result</td>' + 
                        '<td style="width:20%">Index File</td>' +
                        '<td style="width:20%">Time(YYYY-MM-DD_HH-mm)</td>' +
                    '</tr>'+
                '</thead>';
            var tail = '</table>';
            if(e==null){
                res.send(head2+tail);
            }else{
                if(Email=="''"||Email==""||Email=='""'){
                    var bodyHead = "<tbody><tr>";
                    var bodyTail = "</tr></tbody>";
                    var body2 = "";
                    for(i of e){
                        var result;
                        if(i.Done){
                            result = '<a target="_blank" href="http://54.206.175.145:3000/download?id='+i.id+'&result=true'+'">Result</a>';
                        }
                        else{
                            result = "Processing"
                        }
                        var indexfile = '<a target="_blank" href="http://54.206.175.145:3000/download?id='+i.id+'&result=false'+'">'+i.indexFilename+'</a>';
                        body2 += "<tr><td>" +i.indexname +"</td>" + "<td>" +i._uploader.email+"</td>" + "<td>" +result+"</td>" + "<td>" + indexfile +"</td>" + "<td>" +i.time +"</td></tr>";
                    }
                    res.send(head2+ bodyHead + body2+bodyTail+tail);
                }
                else{
                    var bodyHead = "<tbody><tr>";
                    var bodyTail = "</tr></tbody>";
                    var body1 = "";
                    var body2 = "";
                    for(i of e){
                        var result;
                        if(i.Done){
                            result = '<a target="_blank" href="http://54.206.175.145:3000/download?id='+i.id+'&result=true'+'">Result</a>';
                        }
                        else{
                            result = "Processing"
                        }
                        var indexfile = '<a target="_blank" href="http://54.206.175.145:3000/download?id='+i.id+'&result=false'+'">'+i.indexFilename+'</a>';
                        if(i._uploader.email==Email){
                            body1 += "<tr><td>" +i.indexname +"</td>" + "<td>" +result+"</td>" + "<td>" +indexfile+"</td>" + "<td>" +i.time +"</td></tr>";
                        }
                        else{
                            body2 += "<tr><td>" +i.indexname +"</td>" + "<td>" +i._uploader.email+"</td>" + "<td>" +result+"</td>" + "<td>" + indexfile +"</td>" + "<td>" +i.time +"</td></tr>";
                        }
                    }
                    res.send(head1+bodyHead + body1+bodyTail+tail+ head2+ bodyHead + body2+bodyTail+tail);
                }
            }
            
        })
    })

    app.get('/download',(req,res)=>{
        var id = req.query['id'];
        var result = req.query['result'];
        if(result=='true'){
            IndexFile.findOne({id:id}).populate('_uploader').then((e,err)=>{
                const file = __dirname+'/Indexes/'+e._uploader.email+'/'+e.time+'/'+e.result;
                res.download(file);
            })
        }
        else{
            IndexFile.findOne({id:id}).populate('_uploader').then((e,err)=>{
                const file = __dirname+'/Indexes/'+e._uploader.email+'/'+e.time+'/'+e.indexFilename;
                res.download(file);
            })
        }
        
    })

    app.get('/signup',(req,res)=>{
        const options = {
            root: path.join(__dirname)
        };
    
        const fileName = "signup.html";
        res.sendFile(fileName, options, function (err) {
            if (err) {
                next(err);
            } else {
                console.log('Sent:', fileName);
            }
        });
    })

    app.post('/uploads', uploads.array("files"),(req,res) => {
        res.set('Content-Type','text/plain');
        console.log(req.body["Latency"]);
        IndexFile.find({}).then((e,err)=>{
            if(err){
                console.log(err);
            }else{
                var count = 0;
                for(index of e){
                    count ++;
                }
                Tester.findOne({email:req.body['uploaderEmail']}).then((e,err)=>{
                    if(err){
                        console.log("Error index uploading");
                    }
                    else{
                        if(e==null){
                            fs.remove(__dirname+'/uploads/'+req.body["IndexFileName"]);
                            fs.remove(__dirname+'/uploads/'+req.body["uploadedCompeditor"]);
                            res.json({status:"Wrong User"});
                        }
                        else if(e.pw!=req.body["password"]){
                            fs.remove(__dirname+'/uploads/'+req.body["IndexFileName"]);
                            fs.remove(__dirname+'/uploads/'+req.body["uploadedCompeditor"]);
                            res.json({status:"Wrong Password"});
                        }
                        else{
                            console.log("New test from " + req.body["uploaderEmail"] + " with index: "+req.body["uploadedIndex"]);
                            //check wheter the file is right
                            if(fs.existsSync(__dirname+'/uploads/'+req.body["IndexFileName"])&&fs.existsSync(__dirname+'/uploads/'+req.body["uploadedCompeditor"])){
                                if(fs.existsSync(__dirname+'/Indexes/'+req.body["uploaderEmail"]+'/'+(new Date()).getFullYear()+'-'+((new Date()).getMonth()+1)+'-'+(new Date()).getDate()+'_'+(new Date()).getHours()+'-'+(new Date()).getMinutes())){
                                    fs.rmSync(__dirname+'/uploads', { recursive: true, force: true });
                                    res.json({status:"Wrong Time"});
                                    fs.mkdir(__dirname+'/uploads');
                                }
                                else{
                                    fs.move(__dirname+'/uploads/'+req.body["IndexFileName"],__dirname+'/Indexes/'+req.body["uploaderEmail"]+'/'+(new Date()).getFullYear()+'-'+((new Date()).getMonth()+1)+'-'+(new Date()).getDate()+'_'+(new Date()).getHours()+'-'+(new Date()).getMinutes()+'/'+req.body["IndexFileName"]);
                                    fs.move(__dirname+'/uploads/'+req.body["uploadedCompeditor"],__dirname+'/Indexes/'+req.body["uploaderEmail"]+'/'+(new Date()).getFullYear()+'-'+((new Date()).getMonth()+1)+'-'+(new Date()).getDate()+'_'+(new Date()).getHours()+'-'+(new Date()).getMinutes()+'/'+req.body["uploadedCompeditor"]);
                                    IndexFile.create({
                                        _uploader: e._id,
                                        indexname: req.body["uploadedIndex"],
                                        indexFilename: req.body["IndexFileName"],
                                        id:count,
                                        compeditorName:req.body["uploadedCompeditor"],
                                        result: "Not Done",
                                        time: (new Date()).getFullYear()+'-'+((new Date()).getMonth()+1)+'-'+(new Date()).getDate()+'_'+(new Date()).getHours()+'-'+(new Date()).getMinutes(),
                                        Done: false,
                                        writeRatio: req.body['writeRatio'],
                                        Thread: req.body['Thread'],
                                        Latency: req.body['Latency'],
                                        rangeQuery: req.body['rangeQuery'],
                                        range: req.body['range'],
                                        Zipfian: req.body['Zipfian'],
                                    });
                                    res.json({status:"Get the file"});
                                }
                            }
                            else{
                                fs.rmSync(__dirname+'/uploads', { recursive: true, force: true });
                                res.json({status:"Wrong File"});
                                fs.mkdir(__dirname+'/uploads');
                            }
                        }
                    }
                })
            }
        });
    });

    app.get('/uploads',(req,res)=>{
        const options = {
            root: path.join(__dirname)
        };
    
        const fileName = "PostForm.html";
        res.sendFile(fileName, options, function (err) {
            if (err) {
                next(err);
            } else {
                console.log('Sent:', fileName);
            }
        });
    })
})

const server = app.listen(3000);