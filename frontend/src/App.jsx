import React from 'react'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Predict_expression from './components/Predict_frame/Predict_expression'
import Home_page from './components/Home_page/Home_page'

const App = () => {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Home_page />} />
        <Route path="/predict_expression" element={<Predict_expression />} />

      </Routes>
    </Router>
  )
}

export default App
