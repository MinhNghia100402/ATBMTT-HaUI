/* eslint-disable react-hooks/rules-of-hooks */
import "./App.css";
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import * as Docxtemplater from "docxtemplater";
import * as mammoth from "mammoth";
import axios from "axios";

function App() {
  //================================================================
  const [apiFileCall, setapiFileCall] = useState(false);
  const [apiHandCall, setapiHandCall] = useState(false);
  //---------------------------UPLOADING FILE ( BẢN RÕ )--------------------------------
  const [data, setData] = useState(null);
  const [encrypt, setEncrypt] = useState(null);

  const sendFile = (file) => {
    const formData = new FormData();
    formData.append("file", file);

    axios
      .post("http://127.0.0.1:5000/uploadEncrypt", formData)

      .then((response) => {
        // Xử lý kết quả từ máy chủ Python
        const res = response;
        setData(res);
        console.log(res);
        setapiFileCall(true);
      })
      .catch((error) => {
        // Xử lý lỗi

        console.error(error);
      });
  };
  // ============================LẤY GIÁ TRỊ VALUE TỪ INPUT CHUYỂN QUA PYTHON=====================================
  //===========================P=====================================
  const [Pvalue, setPvalue] = useState("");

  const value_P = (event) => {
    setPvalue(event.target.value);
    console.log(event.target.value);
  };
  //===========================Q=====================================
  const [Qvalue, setQvalue] = useState("");

  const value_Q = (event) => {
    setQvalue(event.target.value);
    console.log(event.target.value);
  };
  //===========================E=====================================
  const [Evalue, setEvalue] = useState("");

  const value_E = (event) => {
    setEvalue(event.target.value);
  };
  //===========================N=====================================
  const [Nvalue, setNvalue] = useState("");

  const value_N = (event) => {
    setNvalue(event.target.value);
  };

  //===========================HIỂN THỊ KHÓA P=====================================
  const [p, setP] = useState(null);
  const [q, setQ] = useState(null);
  const [e, setE] = useState(null);
  const [n, setN] = useState(null);
  const [private_key, setPrivateKey] = useState(null);
  const [publicKey, setPublickey] = useState(null);
  const [resutlt, setResutlt] = useState(null);
  //===============================HIỂN THỊ P Q=================================
  const displayPQ = () => {
    setP(data.data.p);
    setQ(data.data.q);
  };
  //===============================HIỂN THỊ E N=================================
  const displayEN = () => {
    if (apiFileCall) {
      const e = data.data.e;
      const n = data.data.n;
      setE(e);
      setN(n);
    }
    if (apiHandCall) {
      const e = data_after_check.data.e;
      const n = data_after_check.data.n;
      setE(e);
      setN(n);
    }
  };
  //===============================SHOW BẢN MÃ=================================
  const [showContent, setShowContent] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const toggleContent = (event) => {
    if (apiFileCall) {
      setShowContent(data.data.content);
      setapiFileCall(false);
    }
    if (apiHandCall) {
      setShowContent(data_after_check.data.content);
      setapiHandCall(false);
    }
  };
  //===========================HIỂN THỊ FILE ĐƯỢC MÃ HÓA=====================================
  const [banro, setBanro] = useState(null);
  const [banroContent, setBanroContent] = useState("");

  const handleInputChange = (event) => {
    setBanro(null);
    setBanroContent(event.target.value);
    console.log(event.target.value);
  };

  const displayBanro = (event) => {
    const file = event.target.files[0];

    if (file) {
      setBanro(file);
      const reader = new FileReader();

      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);

        if (file.name.endsWith(".xlsx")) {
          const workbook = XLSX.read(data, { type: "array" });
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            raw: true,
          });

          const formattedData = jsonData.map((row) =>
            row.map((cell) => {
              if (typeof cell === "number") {
                return cell.toLocaleString("en-US");
              }
              return cell;
            })
          );

          const formattedContent = formattedData
            .map((row) => row.join("\t"))
            .join("\n");
          setBanroContent(formattedContent);

          // Gửi file đến backend
          sendFile(file);
        } else if (file.name.endsWith(".docx")) {
          const result = await readDocxFile(e.target.result);
          setBanroContent(result);

          // Gửi file đến backend
          sendFile(file);
        } else if (file.name.endsWith(".txt")) {
          reader.onload = (e) => {
            const kq = e.target.result; // Nội dung đọc được của file TXT
            setBanroContent(kq); // Gán nội dung đọc được vào biến banroContent
            sendFile(file);
          };
          reader.readAsText(file); // Đọc file TXT
        }
      };

      reader.readAsArrayBuffer(file);
    } else {
      // Nếu không chọn file, sử dụng giá trị từ textarea
      setBanroContent(event.target.value);
      sendFile(event.target.value);
    }
  };

  const readDocxFile = async (buffer) => {
    const data = new Uint8Array(buffer);
    const arrayBuffer = await new Response(data).arrayBuffer();
    const content = await mammoth.extractRawText({ arrayBuffer });
    const result = content.value || "";
    return result;
  };
  // ==========================GỬI GIÁ TRỊ CỦA P VÀ Q VÀ BẢN RÕ SANG MÁY CHỦ ĐỂ KIỂM TRA =======================================
  const [pq_check, setpq_check] = useState(null);
  const [data_after_check, setdata_after_check] = useState(null);
  const [error, setError] = useState(null);
  const handleCheck = () => {
    const formData = new FormData();
    formData.append("file", pq_check);
    formData.append("p", Pvalue);
    formData.append("q", Qvalue);
    formData.append("content", banroContent);

    axios
      .post("http://127.0.0.1:5000/handkey", formData)
      .then((response) => {
        const res = response;
        setapiHandCall(true);
        setdata_after_check(res);
        setError(null);
        if (res.data.result) {
          setError(true);
        } else {
          setError(false);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  //================================================================
  //---------------------------UPLOADING FILE ( BẢN BẢN MÃ )--------------------------------
  const [encr, setencr] = useState(null);
  const sendFileDecrypt = (file) => {
    const formData = new FormData();
    formData.append("file", file);

    axios
      .post("http://127.0.0.1:5000/uploadDecrypt", formData)

      .then((response) => {
        // Xử lý kết quả từ máy chủ Python
        const res = response;
        setencr(res);
        console.log(res);
      })
      .catch((error) => {
        // Xử lý lỗi
        console.error(error);
      });
  };

  //===================HIỂN THỊ FILE MÃ HÓA ===============================
  const [banma, setbanma] = useState(null);
  const [banmaContent, setbanmaContent] = useState("");

  const insertvalue = (event) => {
    setbanma(null);
    setbanmaContent(event.target.value);
  };

  const displayBanMa = (event) => {
    const file = event.target.files[0];

    if (file) {
      setbanma(file);
      const reader = new FileReader();

      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);

        if (file.name.endsWith(".xlsx")) {
          const workbook = XLSX.read(data, { type: "array" });
          const worksheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[worksheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            raw: true,
          });

          const formattedData = jsonData.map((row) =>
            row.map((cell) => {
              if (typeof cell === "number") {
                return cell.toLocaleString("en-US");
              }
              return cell;
            })
          );

          const formattedContent = formattedData
            .map((row) => row.join("\t"))
            .join("\n");
          setbanmaContent(formattedContent);

          // Gửi file đến backend
          sendFileDecrypt(file);
        } else if (file.name.endsWith(".docx")) {
          const result = await readDocxFile(e.target.result);
          setbanmaContent(result);

          // Gửi file đến backend
          sendFileDecrypt(file);
        } else if (file.name.endsWith(".txt")) {
          reader.onload = (e) => {
            const kq = e.target.result; // Nội dung đọc được của file TXT
            setbanmaContent(kq); // Gán nội dung đọc được vào biến banmaContent
            sendFileDecrypt(file);
          };
          reader.readAsText(file); // Đọc file TXT
        }
      };

      reader.readAsArrayBuffer(file);
    } else {
      // Nếu không chọn file, sử dụng giá trị từ textarea
      setbanmaContent(event.target.value);
    }
  };

  const docxfile = async (buffer) => {
    const data = new Uint8Array(buffer);
    const arrayBuffer = await new Response(data).arrayBuffer();
    const content = await mammoth.extractRawText({ arrayBuffer });
    const result = content.value || "";
    return result;
  };
  const [text_dec, settext_dec] = useState(null);
  const viewText = () => {
    const content_decrypt = encr.data.content;
    settext_dec(content_decrypt);
    console.log(content_decrypt);
  };

  //================================================================

  //================================================================
  return (
    <div className="App">
      <div className="left">
        <div className="encrypt-right-key">
          <div className="key">
            <div className="chosse-file-encrypt">
              <label className="choose-file">
                Chọn file
                <input
                  type="file"
                  className="select-file"
                  name="choose"
                  onChange={displayBanro}
                ></input>
              </label>
            </div>
            <div className="check-pq">
              <button onClick={handleCheck}>Kiểm tra</button>
            </div>
            <div className="gennerate-key">
              <button onClick={displayPQ}>Sinh P,Q</button>
            </div>
            <div className="create-key">
              <button onClick={displayEN}>Tạo khóa</button>
            </div>
            <div className="encrypt-rsa">
              <button onClick={toggleContent}>Mã hóa</button>
            </div>
          </div>
          {/* </div> */}
          <div className="encrypt-keypair">
            <div className="left-title">
              <p>BẢN RÕ</p>
            </div>
            <div className="keypair">
              <div className="params">
                <div className="p-vs-q">
                  <div className="p">
                    <label>
                      P
                      <input
                        type="text"
                        value={p}
                        name="p"
                        id="p"
                        placeholder="Nhập P"
                        onChange={value_P}
                      ></input>
                    </label>
                  </div>

                  <div className="q">
                    <label>
                      Q
                      <input
                        type="text"
                        value={q}
                        name="q"
                        placeholder="Nhập Q"
                        onChange={value_Q}
                      ></input>
                    </label>
                  </div>
                </div>

                <div className="check-error">
                  {error === true && (
                    <div className="thoaman">
                      <p>P và Q là số nguyên tố</p>
                    </div>
                  )}
                  {error === false && (
                    <div className="khong-thoaman">
                      <p>P hoặc Q không là số nguyên tố</p>
                    </div>
                  )}
                  {error === null ? null : (
                    <div className="khong-thoaman">
                      <p></p>
                    </div>
                  )}
                </div>

                <div className="e-vs-n">
                  <div className="e">
                    <label>
                      E
                      <input
                        type="text"
                        name="e"
                        value={e}
                        placeholder="Nhập E"
                        onChange={value_E}
                      ></input>
                    </label>
                  </div>

                  <div className="n">
                    <label>
                      N
                      <input
                        type="text"
                        name="n"
                        value={n}
                        placeholder="Nhập N"
                        onChange={value_N}
                      ></input>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="encrypt">
          <div className="encrypt-title">
            <div className="encrypt-name">
              <p>MÃ HÓA</p>
            </div>
          </div>

          {/* ====================================== */}

          <div className="read-fileExel">
            <textarea value={banroContent} onChange={handleInputChange} />
          </div>
          {/* ====================================== */}
        </div>

        <div className="banma">
          <div className="banma-title">
            <p>KẾT QUẢ</p>
          </div>
          <div className="banma-display">
            <textarea value={showContent} />

            {isVisible && (
              <div className="save-file">
                <button>Lưu</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="right">
        <div className="right-title">
          <p>BẢN MÃ</p>
        </div>
        <div className="decrypt-kepair">
          <div className="decrypt-keys">
            <div className="dencrypt-loadFiles">
              <label className="choose-file">
                CHỌN FILES
                <input
                  type="file"
                  className="select-file"
                  name="choose"
                  onChange={displayBanMa}
                ></input>
              </label>
            </div>
            <div className="dencrypt-rsa">
              <button onClick={viewText}>Giải mã</button>
            </div>
          </div>
        </div>
        <div className="dencrypt">
          <div className="dencrypt-title">
            <div className="dencrypt-name">
              <p>GIẢI MÃ</p>
            </div>
          </div>

          <div className="viewFileEncrypt">
            <textarea value={banmaContent} onChange={insertvalue} />
          </div>
        </div>
        <div className="banro">
          <div className="banro-title">
            <p>KẾT QUẢ</p>
          </div>

          <div className="ciphertext-display">{text_dec}</div>
        </div>
      </div>
    </div>
  );
}

export default App;
