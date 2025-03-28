// assignee.js
const assignees = {
    "Lythouse-DMW": {
      dev: "mayur.hatte@zycus.com", // Replace with actual dev account ID
      qc: "shaswat.srivastava@zycus.com",
      infra: "aditi.sinha@zycus.com" // Replace with actual qc account ID
    },
    "Lythouse-Reporting": {
      dev: "mayur.hatte@zycus.com", // Replace with actual dev account ID
      qc: "shaswat.srivastava@zycus.com"
    },
    "Lythouse-Common": {
      dev: "mayur.hatte@zycus.com", // Replace with actual dev account ID
      qc: "shaswat.srivastava@zycus.com"
    },
    "Lythouse-Supplier-GSN":{
      dev: "mayur.hatte@zycus.com", // Replace with actual dev account ID
      qc: "shaswat.srivastava@zycus.com"
    },
    "Lythouse Collab Hub":{
      dev: "mayur.hatte@zycus.com", // Replace with actual dev account ID
      qc: "shaswat.srivastava@zycus.com"
    },
    "Lythouse-Workspace":{
      dev: "mayur.hatte@zycus.com", // Replace with actual dev account ID
      qc: "shaswat.srivastava@zycus.com"
    },
    "Merlin-eInvoice-UI":{
      dev: "anshu.kumar@zycus.com", // Replace with actual dev account ID
      qc: "akash.baidya@zycus.com",
      infra: "aditi.sinha@zycus.com"
    },
    "eInvoice-MA2":{
      dev: "manjunath.p@zycus.com", // Replace with actual dev account ID
      qc: "neema.shaik@zycus.com",
      infra: "aditi.sinha@zycus.com"
    },
    "ZSN-Email":{
      dev: "mayur.hatte@zycus.com", // Replace with actual dev account ID
      qc: "shaswat.srivastava@zycus.com"
    },
    "eInvoice-coa":{
      dev: "sumit.kumar@zycus.com", // Replace with actual dev account ID
      qc: "rahul.patil@zycus.com",
      infra: "aditi.sinha@zycus.com"
    },
    "eInvoice":{
      dev: "rahul.bahirat@zycus.com", // Replace with actual dev account ID
      qc: "sudhakarraju.m@zycus.com",
      infra: "aditi.sinha@zycus.com"
    },
    "eProc-coa":{
      dev: "mayur.hatte@zycus.com", // Replace with actual dev account ID
      qc: "shaswat.srivastava@zycus.com"
    },
    "LMT":{
      dev: "mayur.hatte@zycus.com", // Replace with actual dev account ID
      qc: "reena.kumari@zycus.com"
    },
    "Zycus Data Platform":{
      dev: "mayur.hatte@zycus.com", // Replace with actual dev account ID
      qc: "shaswat.srivastava@zycus.com"
    },
    "Merlin-iRisk-UI":{
      dev: "abhay.yadav@zycus.com", // Replace with actual dev account ID
      qc: "raviteja.nirati@zycus.com"
    },
    "AppXtend":{
      dev: "mayur.hatte@zycus.com", // Replace with actual dev account ID
      qc: "michael.elango@zycus.com"
    },
    "iSave":{
      dev: "mayur.hatte@zycus.com", // Replace with actual dev account ID
      qc: "himachal.raghuwanshi@zycus.com",
      infra: "aditi.sinha@zycus.com"
    },
    "DD-TMS":{
      dev: "sandeep.nikam@zycus.com", // Replace with actual dev account ID
      qc: "banti.das@zycus.com",
      infra: "aditi.sinha@zycus.com"
    },
    "Lythouse-DMW":{
      dev: "pankaj.sharma@zycus.com", // Replace with actual dev account ID
      qc: "suryansh.pandey@zycus.com",
      infra: "aditi.sinha@zycus.com"
    },
    "Merlin Intake":{
      dev: "alok.dubey@zycus.com", // Replace with actual dev account ID
      qc: "ram.mudumby@zycus.com",
      infra: "aditi.sinha@zycus.com"
    },
    "iManage":{
      dev: "amogh.raorane@zycus.com", // Replace with actual dev account ID
      qc: "reena.kumari@zycus.com",
      infra: "aditi.sinha@zycus.com"
    },
    "iPerform":{
      dev: "akshay.kumar@zycus.com", // Replace with actual dev account ID
      qc: "premsagar.s@zycus.com",
      infra: "aditi.sinha@zycus.com"
    },
    "Home":{
      dev: "mayur.hatte@zycus.com", // Replace with actual dev account ID
      qc: "michael.elango@zycus.com",
      infra: "aditi.sinha@zycus.com"
    },
    "iRequest":{
      dev: "sudhansusekhar.s@zycus.com", // Replace with actual dev account ID
      qc: "medha.kamath@zycus.com",
      infra: "aditi.sinha@zycus.com"
    },
    "iRequest-CWF":{
      dev: "sudhansusekhar.s@zycus.com", // Replace with actual dev account ID
      qc: "medha.kamath@zycus.com",
      infra: "aditi.sinha@zycus.com"
    },
    "iRequest-CWF-MA2":{
      dev: "sudhansusekhar.s@zycus.com", // Replace with actual dev account ID
      qc: "medha.kamath@zycus.com",
      infra: "aditi.sinha@zycus.com"
    },
    "iRequest-EMAIL":{
      dev: "sudhansusekhar.s@zycus.com", // Replace with actual dev account ID
      qc: "medha.kamath@zycus.com",
      infra: "aditi.sinha@zycus.com"
    },
    "iRequest-APP":{
      dev: "sudhansusekhar.s@zycus.com", // Replace with actual dev account ID
      qc: "medha.kamath@zycus.com",
      infra: "aditi.sinha@zycus.com"
    },
    "iAnalyze":{
      dev: "manish.gurav@zycus.com", // Replace with actual dev account ID
      qc: "sm.tejas@zycus.com",
      infra: "aditi.sinha@zycus.com"
    },
    "iAnalyze-Email":{
      dev: "manish.gurav@zycus.com", // Replace with actual dev account ID
      qc: "sm.tejas@zycus.com",
      infra: "aditi.sinha@zycus.com"
    },
    "Zycus Data Platform":{
      dev: "manish.gurav@zycus.com", // Replace with actual dev account ID
      qc: "sm.tejas@zycus.com",
      infra: "aditi.sinha@zycus.com"
    },
    "Report Studio":{
      dev: "yogesh.kadam@zycus.com", // Replace with actual dev account ID
      qc: "anandharaj.a@zycus.com",
      infra: "aditi.sinha@zycus.com"
    },
    // Add other products similarly...
  };
  
  module.exports = assignees;