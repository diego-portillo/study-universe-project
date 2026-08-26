const requestOptions = {
  method: 'GET',
  redirect: 'follow'
};

fetch("http://localhost:8082", requestOptions)
  .then(response => {
    if (!response.ok) {
      alert("HTTP error! status: " + response.status);
    }
    return response.json();
  })
  .then(json => {
    document.getElementById("title").textContent = "Backend Response " + json.message;
  })
  .catch(error => alert("error: " + error));