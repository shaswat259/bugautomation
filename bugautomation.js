const axios = require('axios');
const https = require('https');
const fs = require('fs');
const assignees = require('./assignee'); // Import the assignees mapping

// Create an HTTPS agent to disable certificate validation
const agent = new https.Agent({
  rejectUnauthorized: false // Disable SSL certificate validation
});

// Define the base URL for the API
const baseUrl = "https://devtools-primary.zycus.net/testreports";

// Define the environments to process
const environments = ["QCVM","RM"];
// Define the products to process
//const targetProducts = ["iSave", "iManage", "iPerform"];
const targetProducts = ["iSave", "iManage", "iPerform","iRequest","iAnalyze","eInvoice","Report Studio","DD-TMS","Merlin Intake","Lythouse-DMW","eInvoice-coa","Merlin-eInvoice-UI","eInvoice-MA2"];

// Define the mapping rules for product names
const productMapping = {
  "Lythouse-DMW": "ESG lythouse",
  "Lythouse-Reporting": "ESG lythouse",
  "Lythouse-Common": "ESG lythouse",
  "Lythouse-Supplier-GSN": "ESG lythouse",
  "Lythouse Collab Hub": "ESG lythouse",
  "Lythouse-Workspace": "ESG lythouse",
  "Merlin-eInvoice-UI": "eInvoice",
  "ZSN-Email": "ZSN",
  "eInvoice-coa": "eInvoice",
  "iRequest-CWF-MA2": "iRequest",
  "eProc-coa": "eProc",
  "LMT": "DewDrops-LMT",
  "Zycus Data Platform": "iAnalyze",
  "Merlin-iRisk-UI": "iPerform",
  "iRequest-CWF-MA2": "iRequest",
  "iRequest-CWF": "iRequest",
  "iRequest-APP": "iRequest",
  "iRequest-EMAIL": "iRequest",
  "iAnalyze-Email": "iAnalyze",
  "Report Studio": "CRMS",
  "DD-TMS":"TMS",
  "Merlin Intake":"Merlin Assist",
  "eInvoice-MA2":"eInvoice"
};

// Recursive function to extract UIDs from children.children.children.uid
const extractUids = (data, uids = [], limit = 16) => {
  if (uids.length >= limit) return uids; // Stop once we have collected 16 UIDs
  
  if (Array.isArray(data.children)) {
    for (let child of data.children) {
      if (uids.length >= limit) break;
      if (Array.isArray(child.children)) {
        for (let subChild of child.children) {
          if (uids.length >= limit) break;
          if (Array.isArray(subChild.children)) {
            for (let subSubChild of subChild.children) {
              if (subSubChild.uid && uids.length < limit) {
                uids.push(subSubChild.uid); // Add the UID from children.children.children
              }
            }
          }
        }
      }
    }
  }

  return uids;
};

// Function to check if a Jira issue with the same summary already exists
async function checkForExistingBug(summary, label) {
  const jql = `summary ~ "${summary}" AND labels = "${label}"`; // Use summary and label for filtering
  const url = `https://pdtzycus.atlassian.net/rest/api/3/search?jql=${encodeURIComponent(jql)}`;

  try {
    console.log(`Checking for existing bug with summary: "${summary}" and label: "${label}"`);
    const response = await axios.get(url, {
      auth: {
        username: 'shaswat.srivastava@zycus.com',
        password: process.env.token
      }
    });

    return response.data.total > 0; // Return true if issues are found
  } catch (error) {
    console.error('Error checking for existing bugs:', error.response ? error.response.data : error.message);
    return false; // Return false in case of error
  }
}

// Function to fetch data and generate config.js for each environment
const fetchDataAndGenerateConfig = async (environment) => {
  const url = `${baseUrl}/${environment}`;
  try {
    const response = await axios.get(url, { httpsAgent: agent });
    const responseData = response.data;
    const productsL0 = [];
    const productsL1 = [];
    const productsL2 = [];
    const pipelineRunLinksL0 = [];
    const pipelineRunLinksL1 = [];
    const pipelineRunLinksL2 = [];
    const passPercentL0 = [];
    const passPercentL1 = [];
    const passPercentL2 = [];
    const pipelineUidsL0 = [];
    const pipelineUidsL1 = [];
    const pipelineUidsL2 = [];
    const failedTestCasesL0 = [];
    const failedTestCasesL1 = [];
    const failedTestCasesL2 = [];
    const childrenNamesL0 = [];
    const childrenNamesL1 = [];
    const childrenNamesL2 = [];

    // Step 1: Extract products, pipeline run links, and pass percentages for L0, L1, and L2
    for (const product of responseData) {
      if (!targetProducts.includes(product.product)) {
        continue; // Skip products that are not in the target list
      }

      // For L0 (0 index)
      if (product.runStats.length > 0 && product.runStats[0].failed > 0) {
        productsL0.push(product.product);
        pipelineRunLinksL0.push(product.runStats[0].pipelineRunLink);
        passPercentL0.push(product.runStats[0].passPercent);

        const categoryResponseL0 = await axios.get(`${product.runStats[0].pipelineRunLink}data/categories.json`, { httpsAgent: agent });
        const uidsL0 = extractUids(categoryResponseL0.data, [], 16);
        pipelineUidsL0.push(uidsL0);
        const namesL0 = categoryResponseL0.data.children.map(child => child.name);
        childrenNamesL0.push(namesL0);

        const failedCasesL0 = categoryResponseL0.data.children
          .flatMap(child => 
            child.children.flatMap(subChild => 
              subChild.children
                .filter(subSubChild => subSubChild.status === 'failed')
                .map(subSubChild => ({
                  issue: child.name,
                  uid: subSubChild.uid,
                  name: subSubChild.name,
                  statusMessage: subSubChild.name || "No status message available"
                }))
            )
          );
        if (failedCasesL0.length > 0) {
          failedTestCasesL0.push({
            pipelineRunLink: product.runStats[0].pipelineRunLink,
            failedCases: failedCasesL0
          });
        }
      }

      // For L1 (3rd index)
      if (product.runStats.length > 0 && product.runStats[3] && product.runStats[3].failed > 0) {
        productsL1.push(product.product);
        pipelineRunLinksL1.push(product.runStats[3].pipelineRunLink);
        passPercentL1.push(product.runStats[3].passPercent);

        const categoryResponseL1 = await axios.get(`${product.runStats[3].pipelineRunLink}data/categories.json`, { httpsAgent: agent });
        const uidsL1 = extractUids(categoryResponseL1.data, [], 16);
        pipelineUidsL1.push(uidsL1);
        const namesL1 = categoryResponseL1.data.children.map(child => child.name);
        childrenNamesL1.push(namesL1);

        const failedCasesL1 = categoryResponseL1.data.children
          .flatMap(child => 
            child.children.flatMap(subChild => 
              subChild.children
                .filter(subSubChild => subSubChild.status === 'failed')
                .map(subSubChild => ({
                  issue: child.name,
                  uid: subChild.uid,
                  name: subSubChild.name,
                  statusMessage: subSubChild.name || "No status message available"
                }))
            )
          );

        if (failedCasesL1.length > 0) {
          failedTestCasesL1.push({
            pipelineRunLink: product.runStats[3].pipelineRunLink,
            failedCases: failedCasesL1
          });
        }
      }

      // For L2 (6th index)
      // if (product.runStats.length > 0 && product.runStats[6] && product.runStats[6].failed > 0) {
      //   productsL2.push(product.product);
      //   pipelineRunLinksL2.push(product.runStats[6].pipelineRunLink);
      //   passPercentL2.push(product.runStats[6].passPercent);

      //   const categoryResponseL2 = await axios.get(`${product.runStats[6].pipelineRunLink}data/categories.json`, { httpsAgent: agent });
      //   const uidsL2 = extractUids(categoryResponseL2.data, [], 16);
      //   pipelineUidsL2.push(uidsL2);
      //   const namesL2 = categoryResponseL2.data.children.map(child => child.name);
      //   childrenNamesL2.push(namesL2);

      //   const failedCasesL2 = categoryResponseL2.data.children
      //     .flatMap(child => 
      //       child.children.flatMap(subChild => 
      //         subChild.children
      //           .filter(subSubChild => subSubChild.status === 'failed')
      //           .map(subSubChild => ({
      //             issue: child.name,
      //             uid: subSubChild.uid,
      //             name: subSubChild.name,
      //             statusMessage: subSubChild .name || "No status message available"
      //           }))
      //       )
      //     );

      //   if (failedCasesL2.length > 0) {
      //     failedTestCasesL2.push({
      //       pipelineRunLink: product.runStats[6].pipelineRunLink,
      //       failedCases: failedCasesL2
      //     });
      //   }
      // }
    }

    // Prepare the content of the config.js file
    const configContent = `
const productsL0 = ${JSON.stringify(productsL0, null, 2)};
const pipelineRunLinksL0 = ${JSON.stringify(pipelineRunLinksL0, null, 2)};
const passPercentL0 = ${JSON.stringify(passPercentL0, null, 2)};
const pipelineUidsL0 = ${JSON.stringify(pipelineUidsL0, null, 2)};
const failedTestCasesL0 = ${JSON.stringify(failedTestCasesL0, null, 2)};
const childrenNamesL0 = ${JSON.stringify(childrenNamesL0, null, 2)};

const productsL1 = ${JSON.stringify(productsL1, null, 2)};
const pipelineRunLinksL1 = ${JSON.stringify(pipelineRunLinksL1, null, 2)};
const passPercentL1 = ${JSON.stringify(passPercentL1, null, 2)};
const pipelineUidsL1 = ${JSON.stringify(pipelineUidsL1, null, 2)};
const failedTestCasesL1 = ${JSON.stringify(failedTestCasesL1, null, 2)};
const childrenNamesL1 = ${JSON.stringify(childrenNamesL1, null, 2)};

const productsL2 = ${JSON.stringify(productsL2, null, 2)};
const pipelineRunLinksL2 = ${JSON.stringify(pipelineRunLinksL2, null, 2)};
const passPercentL2 = ${JSON.stringify(passPercentL2, null, 2)};
const pipelineUidsL2 = ${JSON.stringify(pipelineUidsL2, null, 2)};
const failedTestCasesL2 = ${JSON.stringify(failedTestCasesL2, null, 2)};
const childrenNamesL2 = ${JSON.stringify(childrenNamesL2, null, 2)};

module.exports = {
  productsL0,
  pipelineRunLinksL0,
  passPercentL0,
  pipelineUidsL0,
  failedTestCasesL0,
  childrenNamesL0,
  productsL1,
  pipelineRunLinksL1,
  passPercentL1,
  pipelineUidsL1,
  failedTestCasesL1,
  childrenNamesL1,
  productsL2,
  pipelineRunLinksL2,
  passPercentL2,
  pipelineUidsL2,
  failedTestCasesL2,
  childrenNamesL2
};
`;

    // Write the content to config.js file
    fs.writeFileSync(`config_${environment}.js`, configContent);
    console.log(`config_${environment}.js has been created successfully with products, pipeline run links, pass percentages, UIDs, and children names for L0, L1, and L2!`);

    // Step 5: Create Jira issues for each product for L0, L1, and L2
    await createIssuesForAllProducts(productsL0, pipelineRunLinksL0, passPercentL0, pipelineUidsL0, failedTestCasesL0, childrenNamesL0, 'L0', environment);
    await createIssuesForAllProducts(productsL1, pipelineRunLinksL1, passPercentL1, pipelineUidsL1, failedTestCasesL1, childrenNamesL1, 'L1', environment);
    await createIssuesForAllProducts(productsL2, pipelineRunLinksL2, passPercentL2, pipelineUidsL2, failedTestCasesL2, childrenNamesL2, 'L2', environment);

  } catch (error) {
    console.error(`Error fetching data for ${environment}:`, error);
  }
};

// Function to create a Jira issue using API
async function createJiraIssue(payload) {
  try {
    const response = await axios.post('https://pdtzycus.atlassian.net/rest/api/3/issue?updateHistory=true&applyDefaultValues=false&skipAutoWatch=true', payload, {
      auth: {
        username: 'shaswat.srivastava@zycus.com',
        password: process.env.token // Replace with your Jira API token
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log(`Jira issue created successfully!`);
    console.log('Jira Issue URL :', `https://pdtzycus.atlassian.net/browse/${response.data.key}`);
    return response.data.key; // Return the issue key for further processing
  } catch (error) {
    console.error('Error creating Jira issue:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
 }
}

// Function to assign a Jira issue to a user
async function assignJiraIssue(issueKey, assigneeId) {
  try {
    await axios.put(`https://pdtzycus.atlassian.net/rest/api/3/issue/${issueKey}/assignee`, {
      accountId: assigneeId // Use the account ID of the assignee
    }, {
      auth: {
        username: 'shaswat.srivastava@zycus.com',
        password: process.env.token
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log(`Jira issue ${issueKey} assigned successfully!`);
  } catch (error) {
    console.error('Error assigning Jira issue:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
  }
}

// Function to fetch PNG links based on UIDs
const fetchPngLinks = async (pipelineRunLink, uids) => {
  const pngLinks = [];
  for (const uid of uids) {
    try {
      const response = await axios.get(`${pipelineRunLink}data/test-cases/${uid}.json`, { httpsAgent: agent });
      const attachments = response.data.testStage.attachments;
      if (attachments && attachments.length > 0) {
        const source = attachments[0].source; // Assuming you want the first attachment's source
        pngLinks.push(source); // Add the source to the PNG links array
      } else {
        pngLinks.push("No PNG available"); // Fallback if no attachments are found
      }
    } catch (error) {
      console.error(`Error fetching PNG link for UID ${uid}:`, error.message);
      pngLinks.push("No PNG available"); // Fallback if there's an error
    }
  }
  return pngLinks;
};

// Function to create the payload for a product
const createPayloadForProduct = async (product, pipelineRunLink, passPercent, failedCases, uids, assigneeType, level, environment, issueType) => {
  let mappedProduct = productMapping[product] || product; // Use mapping or fallback to original product name
  const assigneeId = assignees[product][assigneeType]; // Get the assignee ID based on the type (dev or qc)

  // Fetch PNG links based on UIDs
  const pngLinks = await fetchPngLinks(pipelineRunLink, uids);

  // Filter failed cases for the current issue type
  const filteredFailedCases = failedCases.filter(failedCase => {
    return failedCase.issue === issueType || 
           (issueType === "Script Issue" && (failedCase.issue === "Flaky script issue" || failedCase.issue === "Script issue"));
  });

  const numberOfFailedCases = filteredFailedCases.length;

  // Count occurrences of each issue type
  const issueTypeCounts = {};
  filteredFailedCases.forEach(failedCase => {
    const issueType = failedCase.issue === "Flaky script issue" || failedCase.issue === "Script issue" ? "Script Issue" : failedCase.issue;
    issueTypeCounts[issueType] = (issueTypeCounts[issueType] || 0) + 1;
  });

  // Extract the instance number from the pipeline run link
  const instanceNumber = extractInstanceNumber(pipelineRunLink);

  // Prepare the failed cases for the description
  let displayedFailedCases = filteredFailedCases.slice(0, 10); // Get the first 10 failed cases
  let additionalCasesNote = numberOfFailedCases > 10 ? `+ ${numberOfFailedCases - 10} more cases failed.` : '';

  // Construct the description content
  const descriptionContent = [
    {
      type: "paragraph",
      content: [{ type: "text", text: `Product : ${mappedProduct}\n`, marks: [{ type: "strong" },{ type: "textColor", attrs: { color: "#ff5630" } }] }]
    },
    {
      type: "paragraph",
      content: [{ type: "text", text: `Environment : ${environment}\n`, marks: [{ type: "strong" },{ type: "textColor", attrs: { color: "#ff5630" } }] }]
    },
    {
      type: "paragraph",
      content: [
        { type: "text", text: `Failure Report Link : ${passPercent}% : `, marks: [{ type: "strong" },{ type: "textColor", attrs: { color: "#ff5630" } }] },
        {
          type: "text",
          text: "View Report",
          marks: [{ type: "link", attrs: { href: pipelineRunLink } }]
        }
      ]
    },
    {
      type: "paragraph",
      content: [{ type: "text", text: `Instance Number : ${instanceNumber}\n`, marks: [{ type: "strong" },{ type: "textColor", attrs: { color: "#ff5630" } }] }]
    },
    {
      type: "paragraph",
      content: [{ type: "text", text: `Failure Cases (${numberOfFailedCases})\n`, marks: [{ type: "strong" },{ type: "textColor", attrs: { color: "#ff5630" } }] }]
    },
    ...displayedFailedCases.map((failedCase, index) => {
      const pngLink = pngLinks[index]; // Get the corresponding PNG link
      const screenshotText = pngLink && pngLink !== "No PNG available" ? 
        { type: "text", text: "Screenshot : ", marks: [{ type: "strong" }] } : 
        { type: "text", text: "Screenshot : NA", marks: [{ type: "strong" }] };

      return {
        type: "paragraph",
        content: [
          { type: "text", text: `Failure Scenario ${index + 1} :\n`, marks: [{ type: "strong" }] },
          { type: "text", text: `${failedCase.name} ` },
          screenshotText,
          pngLink && pngLink !== "No PNG available" ? {
            type: "text",
            text: "View Attachment",
            marks: [{ type: "link", attrs: { href: `${pipelineRunLink}data/attachments/${pngLink}` } }]
          } : null
        ].filter(Boolean)
      };
    }),
    {
      type: "paragraph",
      content: [{ type: "text", text: additionalCasesNote, marks: [{ type: "strong" }] }]
    },
    // Append issue type counts to the description
    {
      type: "paragraph",
      content: [
        { type: "text", text: "Issue Type Counts:\n", marks: [{ type: "strong" }] },
        ...Object.entries(issueTypeCounts).map(([issueType, count]) => ({
          type: "text",
          text: `${issueType}: ${count}\n`
        }))
      ]
    }
  ];

  return {
    fields: {
      project: { id: "25533" },
      issuetype: { id: "1" },
      summary: `${environment} : ${level} : ${mappedProduct} : ${passPercent}% : Instance ${instanceNumber} : Failure Percentage less than 100% : Issue Type: ${issueType}`,
      customfield_25167: { value: "UI Automation" },
      components: [{ name: "Automation_Issue" }],
      description: {
        version: 1,
        type: "doc",
        content: descriptionContent
      },
      reporter: { id: "62a8d22e979e6e0069050478" },
      fixVersions: [],
      customfield_15709: { value: "P1" },
      labels: [`${environment}Env_${level}_Stabilization`,`${assigneeType}`],
      customfield_15606: { value: "Critical" },
      environment: {
        type: "doc",
        version: 1,
        content: [{
          type: "paragraph",
          content: [{ type: "text", text: environment }]
        }]
      },
      versions: [],
      customfield_16203: { id: "17932", value: "Yes" },
      customfield_25085: { value: "Cedar" },
      customfield_10128: { value: mappedProduct },
      customfield_29009: []
    }
  };
};

async function getAccountId(email) {
  const url = `https://pdtzycus.atlassian.net/rest/api/3/user/recommend?context=CustomUserField&issueKey=RM-333559&fieldId=customfield_25917&query=${encodeURIComponent(email)}`;

  try {
    const response = await axios.get(url, {
      auth: {
        username: 'shaswat.srivastava@zycus.com',
        password: process.env.token
      }
    });

    if (response.data && response.data.length > 0) {
      const accountId = response.data[0].accountId;
      return accountId;
    } else {
      console.log('No users found in the response.');
      return null;
    }
  } catch (error) {
    console.error('Error fetching account ID:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
    return null;
  }
}

function extractInstanceNumber(pipelineRunLink) {
  const regex = /-(\d+)\//;
  const match = pipelineRunLink.match(regex);
  return match ? match[1] : null;
}

const createIssuesForAllProducts = async (products, pipelineRunLinks, passPercent, pipelineUids, failedTestCases, childrenNames, level, environment) => {
  for (let i = 0; i < products.length; i++) {
    const failedCases = failedTestCases[i]?.failedCases || [];
    const uids = pipelineUids[i] || []; // Get the corresponding UIDs for the product
    const names = childrenNames[i]; // Get the children names for the product

    // Extract unique issue types from failed cases, combining "Flaky script issue" and "Script issue"
    const uniqueIssueTypes = [...new Set(failedCases.map(failedCase => {
      if (failedCase.issue === "Flaky script issue" || failedCase.issue === "Script issue") {
        return "Script Issue"; // Combine both into "Script Issue"
      }
      return failedCase.issue; // Return the original issue type for others
    }))];

    // Create a bug for each unique issue type
    for (const issueType of uniqueIssueTypes) {
      // Create the summary for the issue
      const instanceNumber = extractInstanceNumber(pipelineRunLinks[i]); // Extract the instance number
      const mappedProduct = productMapping[products[i]] || products[i]; // Use mapping or fallback to original product name
      const summary = `${environment} : ${level} : ${mappedProduct} : ${passPercent[i]}% : Instance ${instanceNumber} : Failure Percentage less than 100% : Issue Type: ${issueType}`;
      
      // Construct the label based on the environment and level
      const label = `${environment}Env_${level}_Stabilization`; // Construct the label

      // Check if a bug already exists based on summary and label
      const bugExists = await checkForExistingBug(summary, label);
      if (bugExists) {
        console.log(`A bug with the summary "${summary}" and label "${label}" already exists. Skipping issue creation for product: ${products[i]} with issue type: ${issueType}.`);
        continue; // Skip issue creation if a duplicate is found
      }

      // Determine the assignee type based on the issue type
      let assigneeType;
      if (issueType === "Script Issue") {
        assigneeType = 'qc'; // Assign to QC for script issues
      } else if (issueType === "Bug") {
        assigneeType = 'dev'; // Assign to Dev
      } else if (issueType === "Product defects") {
        assigneeType = 'dev'; // Assign to Dev
      } else if (issueType === "Performance issue") {
        assigneeType = 'dev'; // Assign to Dev
      } else if (issueType === "Infra issue") {
        assigneeType = 'infra'; // Assign to Infra
      } else {
        console.error(`No assignee type found for summary: "${summary}". Skipping issue creation.`);
        continue; // Skip if no assignee type is found
      }

      // Get the email based on the assignee type from the assignees object
      const email = assignees[products[i]][assigneeType];
      const assigneeId = await getAccountId(email);
      if (!assigneeId) {
        console.error(`Could not find account ID for ${email}. Skipping issue creation.`);
        continue; // Skip this iteration if account ID is not found
      }

      // Create the payload to get the labels
      const payload = await createPayloadForProduct(products[i], pipelineRunLinks[i], passPercent[i], failedCases, uids, assigneeType, level, environment, issueType);
      
      // Create the Jira issue
      const issueKey = await createJiraIssue(payload); // Get the issue key after creating the issue

      if (issueKey) {
        await assignJiraIssue(issueKey, assigneeId); // Assign the issue to the user based on the product
      }

      // If the assignee type is 'infra', assign the issue to Aditi
      if (assigneeType === 'Infra issue') {
        const aditiId = await getAccountId('aditi.sinha@zycus.com'); // Get account ID for Aditi
        if (aditiId) {
          await assignJiraIssue(issueKey, aditiId); // Assign the infrastructure issue to Aditi
        }
      }
    }
  }
};
(async () => {
  try {
    for (const environment of environments) {
      await fetchDataAndGenerateConfig(environment);
    }
  } catch (error) {
    console.error('Error in main execution:', error);
  }
})();