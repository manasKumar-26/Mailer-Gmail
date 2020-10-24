# Mailer-Gmail<br>
<h1>Demo Video : https://drive.google.com/file/d/1tEeYjWOyv9It4jkfClLamUcxbxVjIJnX/view?usp=sharing
<h1>Download the zip or clone the project and install all the dependencies from package.json <br>
<h1>Visit https://developers.google.com/gmail/api/quickstart/nodejs and Enable GMAIL API and replace credentials.json in project with your credentials.json <br>
<h3>Do { node index.js } to fire up server and open POSTMAN to test the paths.
<h2>Paths : <br>
  <h5>Authenticate : localhost:8000/api/authenticate <br>
    <p>If It's your first time follow the response steps mentioned in json which is being returned or watch the above demo video .
  <h5>Send Mail : localhost:8000/api/sendMail <br>
    <p>We send the mail info as form so go to body then x-www-form-urlencoded and use keys as
    <ul>
      <li>to
        <li>subject
          <li>body
    </ul>
