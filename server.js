const express = require('express');
require('dotenv').config();
const { exec } = require('child_process');
const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');

// Serve static files from the current directory
app.use(express.static(__dirname));

// Endpoint to run the bugautomation.js script
app.get('/run-bugautomation', (req, res) => {
    exec('node ./bugautomation.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${error.message}`);
            return res.status(500).send(`Error: ${error.message}`);
        }
        if (stderr) {
            console.error(`Script stderr: ${stderr}`);
            return res.status(500).send(`Error: ${stderr}`);
        }
        console.log(`Script output: ${stdout}`);
        res.send(stdout); // Send the logs back to the client
    });
});

// Start the server
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });

app.get('/',(req,res)=>{
    app.use(express.static(path.resolve(__dirname)));
    res.sendFile(path.resolve(__dirname,'index.html'));
  })

  app.listen(PORT, ()=> console.log(`Listening to port ${PORT}`));
