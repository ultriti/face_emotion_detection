import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './predict_expression.css';

import yt_logo from "../../../public/images/app img/yt_logo.png"
import spotify_img_2 from "../../../public/images/app img/spotify omg 2.png"


import aggr_1 from "../../../public/images/song_img/angry/aggrasive music.webp"
import aggr_2 from "../../../public/images/song_img/angry/aggr img.webp"
import aggr_3 from "../../../public/images/song_img/angry/aggr img copy.webp"
import aggr_4 from "../../../public/images/song_img/angry/rage img.jpg"
import aggr_5 from "../../../public/images/song_img/angry/rage 5.webp"

import sad_1 from "../../../public/images/song_img/sad/hamari adhuri kahani.png"
import sad_2 from "../../../public/images/song_img/sad/kyun main jaagun.png"
import sad_3 from "../../../public/images/song_img/sad/rajan 2.png"
import sad_4 from "../../../public/images/song_img/sad/remix.png"

function Predict_expression() {
  const [imageFile, setImageFile] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [dataPredicted, setdataPredicted] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [predicting_load, setpredicting_load] = useState(false);
  const [feeling_name, setfeeling_name] = useState("")
  const [music_link, setmusic_link] = useState([])
  const [music_appose, setmusic_appose] = useState([])

  // feelings
  const feeling = [
    {
      title: "angry",
      songs: [

        {
          Links: {
            yt_link: "https://youtu.be/2_8E9RJ1jL0?si=v0UgMceyDoXH1SBH",
            spotify: ""
          },
          name: "🔥 I Am Killer", img: aggr_2, artist: "striod core", lang: "audio", type: "aggresive"
        },
        {
          Links: {
            yt_link: "https://youtu.be/uNsESDprtTM?si=LyjxubinfLgo0-Pt",
            spotify: ""
          },
          name: "satirin - Matushka ultrafunk", img: aggr_3, artist: "Rash", lang: "brazil", type: "aggresive"
        },
        {
          Links: {
            yt_link: "https://youtu.be/EGSLitjzY5s?si=ei0OJ_DVAi9Wv1C8",
            spotify: ""
          },
          name: "Vxndo x GTXM ", img: aggr_4, artist: "Vxndo", lang: "unkown", type: "aggresive"
        },
        {
          Links: {
            yt_link: "https://youtu.be/8ZkJGG53jGM?si=nnjypI0p6FRESEQH",
            spotify: ""
          },
          name: "AGGRESSIVE MUSIC MIX 💀", img: aggr_1, artist: "steriod studio", lang: "audio", type: "aggresive"
        },
        {
          Links: {
            yt_link: "https://youtu.be/bJhm4BWngjU?si=FnJwrH-3jiLYV-jF",
            spotify: ""
          },
          name: "BERSERK RAGE MODE", img: aggr_5, artist: "ZamSlayer", lang: "audio", type: "aggresive"
        },
      ],
      appose: [
        {
          Links: {
            yt_link: "https://youtu.be/73vpHngEQpA?si=WE3Xgr_ZFmNY6VKQ",
            spotify: ""
          },
          // name: "Galliyan Song ", img: {calm_1}, artist: "Divyansh", lang: "hindi", type: "calm & chill"
        },
        {
          Links: {
            yt_link: "https://youtu.be/Y6RzPqoEEJM?si=Z6JBhWCLIS_kkzHI",
            spotify: ""
          },
          // name: "kal ho na ho flute", img: {calm_2}, artist: "varun kymar", lang: "hindi", type: "calm & chill"
        },
      ],
    },
    {
      title: "sad",
      songs: [
        {
          Links: {
            yt_link: "https://youtu.be/DxsDekHDKXo?si=QzRgbk2wg0qm42Is",
            spotify: ""
          },
          name: "Paro", img: aggr_2, artist: "sony music", lang: "hindi", type: "emotional & sad"
        },
        {
          Links: {
            yt_link: "https://youtu.be/lBvbNxiVmZA?si=0q-jSAQgUmAMvfCH",
            spotify: ""
          },
          name: "Ranjhan", img: sad_3, artist: "T series", lang: "hindi", type: "sad"
        },
        {
          Links: {
            yt_link: "https://youtu.be/sVRwZEkXepg?si=f45EvLgiaEboMQSa",
            spotify: ""
          },
          name: "Hamari adhuri kahani", img: sad_1, artist: "sony music", lang: "hindi", type: "sad & emotional"
        },
        {
          Links: {
            yt_link: "https://youtu.be/C6w075EfZHk?si=m7dbdiJsdGXpTUVz",
            spotify: ""
          },
          name: "sad remix", img: sad_4, artist: "T Series", lang: "remix", type: "sad & emotional"
        },
        {
          Links: {
            yt_link: "https://youtu.be/lN1m7zLBbSU?si=iWR2kv9kvIs4nLzn",
            spotify: ""
          },
          name: "kyun main jaagu", img: sad_2, artist: "T Series", lang: "hindi", type: "sad & emotional"
        },
      ]
    },
    {
      title: "happy",
      songs: [
        {
          Links: {
            yt_link: "https://youtu.be/2_8E9RJ1jL0?si=v0UgMceyDoXH1SBH",
            spotify: ""
          },
          name: "🔥 I Am Killer", img: aggr_2, artist: "striod core", lang: "audio", type: "aggresive"
        },
      ],
      appose: [
        {
          Links: {
            yt_link: "https://youtu.be/2_8E9RJ1jL0?si=v0UgMceyDoXH1SBH",
            spotify: ""
          },
          name: "🔥 I Am Killer", img: aggr_2, artist: "striod core", lang: "audio", type: "aggresive"
        }
      ]
    }
  ]

  const handleFile = (file) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return alert('Please select an image');
    setpredicting_load(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataURL = reader.result;
      const data = { dataURL };

      console.log("url:", data)

      try {
        const response = await axios.post('http://localhost:8000/classify_image', data, {
          withCredentials: true,
        });
        setpredicting_load(false);

        const rawData = response.data?.Data?.[0];
        const classProbs = rawData?.class_probability || [];
        console.log('0--->', response.data);


        let maxProb = null;
        let maxIndex = null;

        if (Array.isArray(classProbs)) {
          maxProb = Math.max(...classProbs);
          maxIndex = classProbs.indexOf(maxProb);
        }

        const responseData_ = {
          name: rawData?.class || null,
          probability: classProbs,
          maxProbability: {
            value: maxProb,
            index: maxIndex
          }
        };

        setdataPredicted(responseData_);
        setResponseData(JSON.stringify(response.data, null, 2));
        setfeeling_name(responseData_.name)
        music_recomended_system(responseData_.name)
      } catch (error) {
        console.error('Upload failed:', error);
        setpredicting_load(false);
      }
    };
    reader.readAsDataURL(imageFile);
  };

  const music_recomended_system = (responseData) => {


    for (let index = 0; index < responseData.length; index++) {

      if (responseData == feeling[index].title) {
        console.log('responseData == feeling.title', responseData == feeling[index].title, responseData);
        setmusic_link(feeling[index].songs)
        setmusic_appose(feeling[index].appose)
      }

    }
  }

  // useEffect(() => {
  //   console.log('feeling_name',feeling_name);

  //   music_recomended_system(feeling_name)
  // }, [feeling_name])



  return (
    <div className="predict_face_frame">
      <nav className="navbar">
        <div className="logo"> AI ML </div>
        <ul className="nav-links">
          <li><a href="/">Home</a></li>
        </ul>
      </nav>

      <div className="Predict_frame_cont">
        <h2>Upload Image for Classification</h2>

        <form onSubmit={handleSubmit}>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <div
            className={`drop_zone ${dragActive ? 'active' : ''}`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <p>Drag & Drop your image here or click to select</p>
          </div>
          <button type="submit">Submit</button>
        </form>

        {predicting_load && (
          <div className="loader-container">
            <div className="loader"></div>
            <p className="loader-text">Predicting...</p>
          </div>
        )}

        {preview && (
          <div className="preview_frame">
            <h3>Preview:</h3>
            <img src={preview} alt="Preview" />
          </div>
        )}

        {dataPredicted && (
          <div className="response_Frame">
            <h3>Result:</h3>
            <h2>emotion: {dataPredicted.name || 'Image cannot be detected'}</h2>
            {/* {dataPredicted.maxProbability?.value !== null && (
              <h2>
                Max Probability: {dataPredicted.maxProbability.value}% (Class {dataPredicted.maxProbability.index + 1})
              </h2>
            )} */}
          </div>
        )}
        {
          music_link ? (
            <div className='music_list_frame'>

              {/* type */}
              <div className="music_list_frame_type">

                {
                  music_link.map((music, index) => (
                    <>
                      <div className="music_info_frame">

                        <div className="music_image_frame">
                          <div className="image_cont">
                            <img src={music.img} alt="" />
                          </div>
                        </div>
                        <div className="music_detail_frame">

                          <div className="music_title_frame">
                            <p className="title_">
                              {music.name}
                            </p>
                            <p className="lang">{music.lang} - {music.artist} - {music.type}</p>
                          </div>
                          <div className="application_list">
                            <div className="yt_img"><a href={`${music.Links.yt_link}`} target='blank_'><img src={yt_logo} alt="" /></a></div>
                            <div className="yt_img"><img src={spotify_img_2} alt="" /></div>
                            {/* <div className="yt_img"></div> */}
                          </div>

                        </div>

                      </div>

                    </>
                  ))
                }
              </div>
              {/* type oppse */}
              <div className="music_list_frame_appose">
                {
                  music_appose.map((music, index) => (
                    <>
                      <div className="music_info_frame">

                        <div className="music_image_frame">
                          <div className="image_cont">
                            <img src={music.img} alt="" />
                          </div>
                        </div>
                        <div className="music_detail_frame">

                          <div className="music_title_frame">
                            <p className="title_">
                              {music.name}
                            </p>
                            <p className="lang">{music.lang} - {music.artist} - {music.type}</p>
                          </div>
                          <div className="application_list">
                            <div className="yt_img"><a href={`${music.Links.yt_link}`} target='blank_'><img src={yt_logo} alt="" /></a></div>
                            <div className="yt_img"><a href={`${music.Links.yt_link}`} target='blank_'><img src={spotify_img_2} alt="" /></a></div>
                            {/* <div className="yt_img"></div> */}
                          </div>

                        </div>

                      </div>

                    </>
                  ))
                }
              </div>


            </div>

          ) : (<></>)
        }
      </div>
    </div>
  );
}

export default Predict_expression;
