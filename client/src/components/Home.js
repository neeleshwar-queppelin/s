import React, { useEffect, useState } from "react";
import "../styles/output.css";
import axios from "axios";
import { BiRefresh } from "react-icons/bi";

export default function Home() {
  const [msg, setMsg] = useState([]);
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);

  //fetch data on page load
  useEffect(() => {
    localStorage.setItem("aliceCount", a);
    localStorage.setItem("bobCount", b);
    axios
      .get("http://localhost:8080/conversations")
      .then((response) => {
        let temp = [];
        response.data.conversations.map((element, index) =>
          element.conversations.map((x) => temp.push(x.lastMutation.text))
        );

        setMsg(temp);
        let b = document.getElementById("b");
        b.click();
      })
      .catch((err) => {
        console.error("Mutation Error");
      });
  }, []);

  function ping() {
    axios
      .get("http://localhost:8080/ping")
      .then((response) => {
        console.log("Ping Response->", response);
        document.getElementById("responseDiv").innerHTML = response.data.msg;
      })
      .catch((err) => {
        console.error("Ping Error");
      });
  }

  function info() {
    let user = document.getElementById("userSelected").value;

    axios
      .post("http://localhost:8080/info", { user: user })
      .then((response) => {
        console.log("Info Response->", response);
        document.getElementById("responseDiv").innerHTML =
          response.data.author.name +
          "&nbsp:-&nbsp&nbsp&nbsp" +
          response.data.author.email;
      })
      .catch((err) => {
        console.error("Info Error", err);
      });
  }

  function mutation() {
    let user = document.getElementById("userSelected").value;
    let textPassed = document.getElementById("textPassed").value;

    let finalText = document.getElementById("msgDiv").innerText + textPassed;
    console.log("===============>", finalText);
    axios
      .post("http://localhost:8080/mutations", {
        author: user,
        origin: {
          alice: a,
          bob: b,
        },
        conversationId: 341,
        data: {
          type: "insert",
          index: "number",
          length: "textsLength",
          text: finalText,
        },
      })
      .then((response) => {
        console.log("Mutation Response s", response);
        if (user == "alice") {
          let x = a;
          x++;
          setA(x); //increase count when alice sends text
        }
        if (user == "bob") {
          let y = b;
          y++;
          setB(y); //increase count when bob sends text
        }

        document.getElementById("msgDiv").append(`${msg}` + `${textPassed}`);
        var br = document.createElement("br");
        document.getElementById("msgDiv").appendChild(br);
      });
  }

  //delete last message
  function deleteFunc() {
    let user = document.getElementById("userSelected").value;
    let text = document.getElementById("textPassed").value;
    axios
      .post("http://localhost:8080/mutations", {
        author: user,
        data: {
          type: "delete",
          text: text,
        },
      })
      .then((response) => {
        console.log("Mutation Response", response);
      });

    window.location.reload();
  }
  return (
    <div className="flex flex-col h-screen justify-between overflow-hidden">
      <div
        className="container-fluid bg-gradient-to-r from-green-100 to-blue-100  p-4 rounded-lg m-4 h-screen overflow-auto relative "
        id="msgDiv"
      >
        {/* Refresh button */}
        <div className="absolute right-0 top-0 m-4">
          <BiRefresh
            className="w-12 h-8 bg-gray-100 rounded-lg hover:text-current"
            onClick={() => {
              window.location.reload();
            }}
          />
        </div>
        <div className="text-lg">
          {msg && msg.length != 0
            ? msg.map((value) => (
                <div>
                  <p>{value}</p>
                  <br />
                </div>
              ))
            : ""}
        </div>
      </div>

      <div className="flex">
        <div className="flex items-center">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-medium px-4 m-2 rounded-lg w-36 h-12"
            onClick={ping}
          >
            Ping
          </button>
          <button
            onClick={info}
            className="bg-blue-500 hover:bg-blue-700 text-white font-medium px-4 m-2 rounded-lg w-36 h-12"
          >
            Info
          </button>
          <select
            className="m-4 text-xl w-20 bg-gray-200 p-1 rounded-lg h-12"
            id="userSelected"
          >
            <option className="p-2 rounded-sm" value="alice">
              Alice
            </option>
            <option value="bob">Bob</option>
          </select>
        </div>
        <div className="flex-1 m-auto mx-6 items-center justify-center ">
          <div
            className="flex rounded-lg border-2 border-gray-200 items-center justify-center h-20"
            id="responseDiv"
          ></div>
        </div>
      </div>
      <div className="">
        <div className="flex items-center justify-end m-4 ">
          <input
            id="textPassed"
            type="text"
            placeholder="message"
            className="w-full  h-28 bg-gray-200 rounded-lg p-4"
          />
          <div className="flex-col ">
            <div className="flex">
              <button
                onClick={mutation}
                className="bg-blue-500 hover:bg-blue-700 text-white font-medium px-4 m-2 rounded-lg w-36 h-12"
              >
                Insert
              </button>
            </div>
            <div className="flex justify-center">
              <button
                onClick={deleteFunc}
                className="bg-blue-500 hover:bg-blue-700 text-white font-medium px-4 m-2 rounded-lg w-36 h-12"
              >
                Delete Last
              </button>
            </div>
          </div>

          <button
            id="b"
            onClick={() => {
              axios
                .get("http://localhost:8080/conversations")
                .then((response) => {
                  let temp = [];
                  response.data.conversations.map((element, index) =>
                    element.conversations.map((x) =>
                      temp.push(x.lastMutation.text)
                    )
                  );

                  setMsg(temp);
                  console.log("msg------  >", msg);
                });
            }}
          ></button>
        </div>
      </div>
    </div>
  );
}
