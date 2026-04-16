var requestOptions = {
  method: 'GET',
  redirect: 'follow'
};

fetch("http://localhost:8082", requestOptions)
  .then(res => {
    if (!res.ok) {
      alert("HTTP error! status: " + res.status);
    }
    return res.json();
  })
  .then(json => {
    document.getElementById("title").textContent = "Backend Response " + json.message;
  
  })
  .catch(error => alert("error: " + error));