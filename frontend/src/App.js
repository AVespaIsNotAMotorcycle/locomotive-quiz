import React, { useEffect, useState } from 'react';
import axios from 'axios';

import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';

import logo from './logo.svg';
import './App.css';

function Checkbox({
  model,
  value,
  correctValue,
  answerQuestion,
  submitted,
  index,
}) {
  const correct = submitted ? correctValue : undefined;
  return (
    <label htmlFor={model} className={String(correct)}>
      <input
        type="checkbox"
        id={model}
        name={model}
        value={value}
        disabled={submitted}
        onChange={({ target }) => { answerQuestion(index, target.checked); }}
      />
      <CheckBoxOutlineBlankIcon className="unchecked" />
      <CheckBoxIcon className="checked" />
      <CheckCircleOutlineIcon className="correct" />
      <DoNotDisturbIcon className="incorrect" />
      {model}
    </label>
  );
}

function generateOrder() {
  const order = [0, 1, 2, 3];
  const max = 10;
  for (let iteration = 0; iteration < max; iteration += 1) {
    const index1 = Math.floor(Math.random() * order.length);
    const index2 = Math.floor(Math.random() * order.length);
    const element2 = order[index2];
    order[index2] = order[index1];
    order[index1] = element2;
  }
  return order;
}

function App() {
  const [image, setImage] = useState();
  const [givenAnswers, setGivenAnswers] = useState([false, false, false, false]);
  const [correctAnswers, setCorrectAnswers] = useState([undefined, undefined, undefined, undefined]);
  const [submitted, setSubmitted] = useState(false);
  const [order, setOrder] = useState(generateOrder());

  const loadNew = () => {
    axios.get('http://localhost:8000/random')
      .then(({ data }) => {
        if (data.models.length > 4) { loadNew(); return; }
        setImage(data);
        setCorrectAnswers(data.options.map((model) => data.models.includes(model)));
      });
    setSubmitted(false);
    setGivenAnswers([
      false,
      false,
      false,
      false,
    ]);
    setOrder(generateOrder());
  };
  const onSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };
  const answerQuestion = (index, value) => {
    const newAnswers = [...givenAnswers];
    newAnswers[index] = value;
    setGivenAnswers(newAnswers);
  };

  const modelsCount = correctAnswers.filter((answer) => answer === true).length;
  const scoreCount = givenAnswers
    .filter((answer, index) => answer && answer === correctAnswers[index]).length;

  useEffect(loadNew, []);

  const modelName = (manufacturer, model) => {
    if (manufacturer) return `${manufacturer} ${model}`;
    return model
  };

  if (!image) return 'Loading...';
  return (
    <main>
      <img src={image.source} alt="A locomotive" />
      <form onSubmit={onSubmit}>
        <span className="instructions">
          Select all locomotive models which appear in the picture.
        </span>
        {order.map((index) => (
          <Checkbox
            model={modelName(image.manufacturers[index], image.options[index])}
            key={`${image.source}-${image.options[index]}`}
            value={givenAnswers[index]}
            correctValue={correctAnswers[index]}
            answerQuestion={answerQuestion}
            submitted={submitted}
            index={index}
          />
        ))}
        {submitted
          ? (
            <>
              <span className="score">{`${scoreCount} / ${modelsCount} correct`}</span>
              <button type="button" onClick={loadNew}>Next</button>
            </>
          ) : <button type="submit">Submit</button>}
      </form>
    </main>
  );
}

export default App;
