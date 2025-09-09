// 22 questions in json file
import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const  __filename = fileURLToPath(import.meta.url);
const  __dirname=path.dirname(__filename);


const app=express();


app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

let questions=JSON.parse(fs.readFileSync(path.join(__dirname,"questions.JSON"),"utf-8"));

function shuffle(array){
    return array.sort(()=>Math.random()-0.5);
}

let gameData={};

app.get("/",(req,res)=>{
    res.render("home");
});

//start the quiz
app.post("/start",(req,res)=>{
     let username = req.body.username.trim();
  if (!username) return res.redirect("/");

  username = encodeURIComponent(username);  
    const selectedQuestions=shuffle([...questions]).slice(0,10);

    gameData[username]={
          questions:selectedQuestions,
          current:0,
          score:0,
          answers:[]
};
   res.redirect(`/qload/${username}`);
});

//loads the question
app.get("/qload/:username",(req,res)=>{
      const username = decodeURIComponent(req.params.username);
  const usergame = gameData[username];

  if (!usergame) return res.redirect("/"); 

    if(usergame.current>=10){
        res.redirect(`/result/${username}`);
        return;
    }

    const q=usergame.questions[usergame.current];
    res.render("qload",{
        username,
        qno:usergame.current+1,
        question:q.question,
        options:q.options

    });
});

//submit answer
app.post("/submit/:username",(req,res)=>{
     const username = decodeURIComponent(req.params.username);
  const usergame = gameData[username];

  if (!usergame) return res.redirect("/");
    const userans=req.body.answer;

    let correctans=usergame.questions[usergame.current].answer;
    if(userans===correctans){
        usergame.score++;
    }
     
    usergame.answers.push({
        question:usergame.questions[usergame.current].question,
        userans,
        correctans
    });

    usergame.current++;
    res.redirect(`/qload/${username}`);

});

//result page
app.get("/result/:username",(req,res)=>{
     const username = decodeURIComponent(req.params.username);
  const usergame = gameData[username];

  if (!usergame) return res.redirect("/");

    let badge="Bronze";
    if(usergame.score>=8) badge="Gold";
    else if(usergame.score>=5) badge="Sliver";

    res.render("result",{
        username,
        score:usergame.score,
        badge
    });
});


//Review page
app.get("/review/:username",(req,res)=>{
    const username = decodeURIComponent(req.params.username);
    const usergame=gameData[username];
    if (!usergame) return res.redirect("/");

    res.render("review",{
        username,
        answers:usergame.answers
    });
});

export default app;