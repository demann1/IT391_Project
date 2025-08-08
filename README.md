# IT391_Project
Repository for IT 391

Slide Sage 

Description:
Slide Sage is a website that takes your powerpoint or pdf and allows you to curate an AI generated response, like a summarization or suggestion. Useful for both students and professors, we hope you enjoy using this tool and use it responsibly!

Set up:
1. This is hosted on ngrok and uses it as a proxy, in order to make it run locally, we recommend creating an account and getting a free static domain and then adding your personal URL to the CORS origin in pptx_ai_integration.py.

 You will also need a .env in /client with the variable REACT_APP_NGROK_URL set as your static ngrok domain. You will also need to authenticated your computer using the command: ngrok config add-authtoken TOKEN. More information about finding your ngrok authtoken is available here: https://ngrok.com/docs/agent/ 

2. After setting this up, you just need to start the frontend by navigating into ../client and running npm start, which should open the react app 

3. The next step is starting the backend, which uses flask, by running pptx_ai_integration.py in your terminal while in the project folder. 

4. The last step is starting the ngrok agent using ngrok http --domain=your-static-domain

Notes:
If you are seeing the error "AI busy. Please try again." Open your web console and you should see what is causing the issue.
