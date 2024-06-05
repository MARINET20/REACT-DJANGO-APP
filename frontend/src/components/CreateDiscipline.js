import React, { Component } from 'react';
import Multiselect from 'multiselect-react-dropdown';
import * as XLSX from 'xlsx';
import {API_URL} from '..';
import AuthContext from './AuthContext';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';


export class CreateDiscipline extends Component {

  constructor(props) {
    super(props);
    this.state = {
      students: [],
      skills: [],
      disciplines: [],
      selectedStudents: [],
      selectedSkills: [],
      newTagInput: '',
      selectedDiscipline: [],
      formData: {
        discipline: [],
        student:[],
        skill:[],
        score: null
      },
      formDataFile: {
        discipline: [],
        student:[],
        skill:[],
        score: []
      },
      data: [],
      formData: [],
      dataLoaded: false,
      formDataTitle: null,
      isFormSkillVisible: false,

      reportFile: null,
      responseData: [],
      responseDataLoaded: false,
      isFormDisciplineVisible: false,
      newDisciplineInput: '',
      studentName: null,
      score: null,
      projectName: null
    };
  }

  async componentDidMount() {
    try {
      const authTokens = JSON.parse(localStorage.getItem('authTokens'));
      if (authTokens) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${authTokens.access}`;
          const decodedUser = jwtDecode(authTokens.access);
          this.fetchUserData(decodedUser.user_id);

          const studResponse = await fetch(`${API_URL}/students`);
          const data = await studResponse.json();
          this.setState({ students: data });

          const skillResponse = await fetch(`${API_URL}/skill`);
          const skill = await skillResponse.json();
          this.setState({ skills: skill });

          const disciplineResponse = await fetch(`${API_URL}/discipline`);
          const discipline = await disciplineResponse.json();
          this.setState({ disciplines: discipline });
      }
      
    } catch (error) {
      console.error('Ошибка при выборке данных:', error);
    }
  }

  fetchUserData = async (user_id) => {
    try {
      const userResponse = await axios.get(`${API_URL}/user/${user_id}`);
      this.setState({ is_student: userResponse.data.is_student });
    } catch (error) {
      console.error('Ошибка при получении пользовательских данных:', error);
      alert('Войдите в систему');
      localStorage.removeItem('authTokens')
    }
  };

  onSelect = (selectedList) =>{
    this.setState({ selectedStudents: selectedList }); 
  }

  onSelectSkill = (selectedList) =>{
    this.setState({ selectedSkills: selectedList }); 
  }

  onSelectDiscipline = (selectedList) =>{
    this.setState({ selectedDiscipline: selectedList }); 
  }

  handleSubmit = async (e) => {
    e.preventDefault();

    if (this.state.selectedDiscipline.length > 1) {
      alert('Выберите одну дисциплину!');
    }

    const studentsArray = this.state.selectedStudents.map(student => student.id);
    const disciplinesArray = this.state.selectedDiscipline[0].id;
    // const skillsArray = this.state.selectedSkills.map(skill => skill.id);

    const discipline = this.state.selectedDiscipline[0].id;
    const newDiscipline = this.state.selectedDiscipline[0];
    const student = this.state.selectedStudents.map(student => student.id);
    const skill = this.state.selectedSkills;
    const score = this.state.score;
    const projectName = this.state.projectName;

    try {
        const response = await fetch(`${API_URL}/add/grade`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              discipline,
              student,
              skill,
              score,
              newDiscipline,
              projectName
            }),
        });

        if (response.ok) {
            const data = await response.json();
            this.setState({ message: data.message, error: null });
            alert('Оценка за дисциплину успешно добавлена!');

            // Очистка полей после успешной отправки
            this.setState({
              selectedSkills: '',
              formData: {
                ...this.state.formData,
                score: '',
              },
              selectedDiscipline: null,
              selectedStudents: '',
            });

        } else {
            const data = await response.json();
            this.setState({ error: data.error, message: null });
            alert(this.state.error);
        }
    } catch (error) {
        this.setState({ error: "Ошибка при добавлении оценки", message: null });
        alert('Ошибка при добавлении оценки(ок)');
        console.error(this.state.error);
    }
  }

  // Метод для добавления новых навыков в список
  addNewRequirement = (event) => {
    event.preventDefault(); // Предотвращение действия по умолчанию

    const newSkill = this.state.newTagInput.trim();
    if (newSkill !== '') {
        const updatedSkills = [...this.state.skills, { id: null, skill: newSkill }];

        this.setState({ 
            skills: updatedSkills,
            selectedSkills: [...this.state.selectedSkills, { id: null, skill: newSkill }],
            newTagInput: '',
            isFormSkillVisible: false 
        });
    }
  };

  addNewDisciplines = (event) => {
    event.preventDefault();

    const newDiscipline = this.state.newDisciplineInput.trim();
    if (newDiscipline !== "") {
      const updatedDisciplines = [...this.state.disciplines, { id: null, name: newDiscipline }];
      
      this.setState({
          disciplines: updatedDisciplines,
          selectedDiscipline: [...this.state.selectedDiscipline, { id: null, name: newDiscipline }],
          newDisciplineInput: "", 
          isFormDisciplineVisible: false 
      });
    }
  };

  handleSubmitFile = async (e) => {
    e.preventDefault();
    const skillsArray = this.state.selectedSkills ? this.state.selectedSkills.map(skill => skill.id) : []

    const { formDataFile } = this.state;
    formDataFile.discipline = this.state.formDataTitle;
    formDataFile.score =  this.state.formData.map(data => data.score);
    formDataFile.student = this.state.formData.map(data => data.email);
    formDataFile.skill = this.state.selectedSkills;
    this.setState({ formDataFile });

    try {
        const response = await fetch(`${API_URL}/add/grade-file`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(this.state.formDataFile),
        });

        if (response.ok) {
            const data = await response.json();
            this.setState({ message: data.message, error: null });
            alert('Оценки за дисциплину успешно добавлены!');
        } else {
            const data = await response.json();
            this.setState({ error: data.error, message: null });
            alert('Выберите теги учебной дисциплины!');
        }
    } catch (error) {
        this.setState({ error: "Ошибка при добавлении оценки", message: null });
        alert('Ошибка при добавлении оценки(ок)');
        console.error(this.state.error);
    }
  }

  handleChange = (e) => {
    this.setState({ ...FormData, score: e.target.value });
  }

  handleScoreChange = (e) => {
    this.setState({ score: e.target.value });
  }

  toggleFormSkillVisibility = () => {
    this.setState({ isFormSkillVisible: !this.state.isFormSkillVisible});
  };

  toggleFormDisciplineVisibility = () => {
    this.setState({ isFormDisciplineVisible: !this.state.isFormDisciplineVisible});
  };

  handleNewTagInputChange = (e) => {
    this.setState({ newTagInput: e.target.value });
  };

  handleFileUpload = e => {
    const file = e.target.files[0];
    const title = file['name'].replace(/^([0-9-]+ [0-9-]+ )/, '').replace(/\.([̇a-z]+)/, '').replace(/\.([̇a-z]+)/, '');
    const reader = new FileReader();
    reader.onload = (evt) => {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }).slice(1);
        const [header, ...rows] = data;

        const formDataStud = ['Обучающийся', 'Электронная почта', 'Итог текущ.', 'Итоговая оценка'].map(name => header.indexOf(name));
        const [nameId, emailId, markId, scoreId] = formDataStud;
        const formData = rows.map(row => ({
          name: row[nameId],
          email: row[emailId],
          mark: row[markId],
          score: row[scoreId] === 'не явился' || row[scoreId] === 'неудовл.' ? 2 : row[scoreId] === 'удовл.' ? 3 : row[scoreId] === 'хор.' ? 4 : row[scoreId] === 'отл.' ? 5 : row[scoreId]
        }));
        this.setState({ formData, dataLoaded: true, formDataTitle: title });
    };
    reader.readAsBinaryString(file);
  }

  handleFileChange = async (event) => {
    const reportFile = event.target.files[0];
    const formData = new FormData();
    formData.append('report_file', reportFile);
    try {
        const response = await axios.post(`${API_URL}/upload-report`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        });

        if (response.status === 200) {
          const data = await response.data;
          console.log(data);
          this.setState({studentName: data.data[0]['Students'], responseData: data.data[0]['Skills'], responseDataLoaded: true, dataLoaded: true});
        } else {
          const data = await response.data;
          alert('Ошибка в получении навыков');
        }
    } catch (error) {
        console.error('Отчет об ошибке при загрузке:', error);
    }
  };

  handleNewDisciplineInputChange = (e) => {
    this.setState({ newDisciplineInput: e.target.value });
  };

  handleSubmitReport = async (e) => {
    e.preventDefault();

    const discipline = this.state.selectedDiscipline[0];
    const student = this.state.studentName;
    const skill = Object.values(this.state.responseData).map((item, index) => item);
    const score = this.state.score;
    const projectName = this.state.projectName;
    // const students = this.state.selectedStudents.map(data => data.id);


    console.log('Данные из отчета: ', discipline, student, skill, score);
    try {
      const response = await fetch(`${API_URL}/add-skills-from-report`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            discipline,
            student,
            skill,
            score,
            projectName
          }),
      });
      if (response.ok) {
          const data = await response.json();
          alert('Данные за дисциплину успешно добавлены!');

          // Очистка полей после успешной отправки
          this.setState({
            responseData: [],
            projectName: '',
            score:'',
            selectedDiscipline: null,
            studentName: '',
          });
      } else {
          const data = await response.json();
          alert(this.state.error);
      }
    } catch (error) {
        this.setState({ error: "Ошибка при добавлении оценки", message: null });
        alert('Ошибка при добавлении оценки(ок)');
        console.error(this.state.error);
    }
  }

  handleProjectNameChange = (e) => {
    this.setState({projectName: e.target.value});
  };

  render() {
    const { is_student, responseData, responseDataLoaded, studentName } = this.state;

    return (
    <AuthContext.Consumer>
    {({ user }) => (
      <div className='container'>
        { user && !is_student &&(
          <div>
          <div className='pt-30 d-flex mt-3 justify-content-between'>
            <h1 className="m-0" style={{color: '#00AEEF'}}>Успеваемость</h1>
            <div className='d-flex justify-content-between'>
              <div>
                <button className="update-file" onClick={() => this.fileInput.click()}>
                  <img width="24" height="24" src="https://img.icons8.com/pastel-glyph/64/FFFFFF/upload--v1.png" alt="upload--v1"/>
                  Загрузить файл
                </button>
                <input
                  ref={(ref) => this.fileInput = ref}
                  type="file"
                  onChange={this.handleFileUpload}
                  style={{ display: 'none' }}
                />
              </div>
              <div style={{marginLeft:'10px'}}>
                <button className="update-file" style={{background: '#00abed'}} onClick={() => this.inputFile.click()}>
                  <img width="24" height="24" src="https://img.icons8.com/forma-light/24/FFFFFF/file.png" alt="file"/>
                  Загрузить отчет
                </button>
                <input
                  ref={(ref) => this.inputFile = ref}
                  type="file"
                  style={{ display: 'none' }}
                  onChange={this.handleFileChange}
                />
              </div>
            </div>
          </div>
        {this.state.dataLoaded && (
          (responseDataLoaded ? (
            <div>
              <form onSubmit={this.handleSubmitReport}>
                <div className="row mt-3">
                  <div className="col">
                    <div className='d-flex'>
                      <label className="form-label" htmlFor="name" style={{fontWeight:'600'}}>Выберите учебную дисциплину</label>
                    </div>
                    <Multiselect
                      options={this.state.disciplines ? this.state.disciplines : []}
                      placeholder="Дисциплины"
                      selectedValues={this.state.selectedDiscipline} 
                      onSelect={this.onSelectDiscipline} 
                      onRemove={this.onSelectDiscipline}
                      displayValue="name"
                    />
                  </div>
                </div>
                <div className='d-flex mt-2'>
                    <img width="32" height="32" 
                    onClick={this.toggleFormDisciplineVisibility}
                    style={{ cursor: 'pointer', marginLeft:'5px'}}
                    src="https://img.icons8.com/small/32/00abed/add.png" alt="add"/>
                    <p style={{ color: "#00aeef"}}><small>Добавить дисциплину, которой нет в списке</small></p>
                </div>
                {this.state.isFormDisciplineVisible && (
                  <div>
                    <input
                      type="text"
                      value={this.state.newDisciplineInput}
                      onChange={this.handleNewDisciplineInputChange}
                    />
                    <span className="lh-24" style={{ fontSize: '14px',marginLeft:'10px', cursor:'pointer', background:'#00ABED', color:'white', padding: '7px 24px', borderRadius: '20px', fontWeight: '600'}} onClick={this.addNewDisciplines}>добавить</span>
                  </div>
                )}
                {/* <div className="row mt-3">
                  <div className="col">
                    <label className="form-label" htmlFor="name" style={{fontWeight:'600'}}>Выберите студента</label>
                    <Multiselect
                        options={this.state.students ? this.state.students : []}
                        placeholder="Студенты"
                        selectedValues={this.state.selectedStudents} 
                        onSelect={this.onSelect} 
                        onRemove={this.onSelect}
                        displayValue="name"
                    />
                  </div>
                </div> */}
                <div className='row mt-3'>
                  <div className="col">
                  <label className="form-label" htmlFor="course" style={{fontWeight:'600'}}>Студент(ы)</label>
                  <br/>
                  {Object.values(studentName).map((item, index) => (
                      <span 
                      className="info-team"
                      key={index}>{item}</span>
                  ))}
                  {Object.values(studentName).length > 1 && (
                    <input 
                    type="text" 
                    className="form-control mt-3" 
                    placeholder="Название проекта" 
                    value={this.state.projectName} 
                    onChange={this.handleProjectNameChange} 
                  />
                  )}
                  </div>
                </div>
                <div className='row mt-3'>
                  <div className="col">
                  <label className="form-label" htmlFor="course" style={{fontWeight:'600'}}>Навыки</label>
                  <br/>
                  {Object.values(responseData).map((item, index) => (
                      <span 
                      className="info-team"
                      key={index}>{item}</span>
                  ))}
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col">
                    <label className="form-label" htmlFor="score" style={{fontWeight:'600'}}>Введите оценку за дисциплину</label>
                    <input 
                    className="form-control" 
                    type="number" 
                    name="score" 
                    value={this.state.score} 
                    onChange={this.handleScoreChange}
                    min='2'
                    max='5' />
                  </div>
                </div>
                <button className="btn btn-primary btn-sm mt-3" type="submit">Добавить</button>
              </form>
            </div>
          ) : (
            <div>
              <form onSubmit={this.handleSubmitFile} className='mt-3'>
                <div className="row mt-3">
                    <div className="col">
                    <label className="form-label" htmlFor="name" style={{fontWeight:'600'}}>Учебная дисциплина</label>
                    <input 
                      className="form-control" 
                      type="text" 
                      name="name" 
                      value={this.state.formDataTitle} 
                    />
                    </div>
                </div>
                <div className="row mt-3">
                  <div className="col">
                    <label className="form-label" htmlFor="course" style={{fontWeight:'600'}}>Выберите навык(и)</label>
                    <Multiselect
                        options={this.state.skills ? this.state.skills : []}
                        placeholder="Навыки"
                        selectedValues={this.state.selectedSkills } 
                        onSelect={this.onSelectSkill} 
                        onRemove={this.onSelectSkill}
                        displayValue="skill"
                    />
                  </div>
                </div>
                <div className='d-flex mt-2'>
                    <img width="32" height="32" 
                    onClick={this.toggleFormSkillVisibility}
                    style={{ cursor: 'pointer', marginLeft:'5px'}}
                    src="https://img.icons8.com/small/32/00abed/add.png" alt="add"/>
                    <p style={{ color: "#00aeef"}}><small>Добавить навыки, которых нет в списке</small></p>
                </div>
                {this.state.isFormSkillVisible && (
                    <div>
                        <input
                            type="text"
                            value={this.state.newTagInput}
                            onChange={this.handleNewTagInputChange}
                        />
                        <span className="lh-24" style={{ fontSize: '14px',marginLeft:'10px', cursor:'pointer', background:'#00ABED', color:'white', padding: '7px 24px', borderRadius: '20px', fontWeight: '600'}} onClick={this.addNewRequirement}>добавить</span>
                    </div>
                )}
                <div className="row mt-3">
                  <div className="col">
                  <label className="form-label" htmlFor="course" style={{fontWeight:'600'}}>Студенты</label>
                  <br/>
                  {this.state.formData.map((data, index) => (
                    <span 
                    className="info-team"
                    key={index}>{data.name} - оценка: {data.score}</span>
                  ))}
                  </div>
                </div>
                <button className="btn btn-primary btn-sm mt-3" type="submit">Добавить</button>
              </form>
            </div>
          ))
        )}
        {!this.state.dataLoaded && 
          <form onSubmit={this.handleSubmit} className='mt-3'>
            <div className="row">
              <div className="col">
                <div className='d-flex'>
                  <label className="form-label" htmlFor="name" style={{fontWeight:'600'}}>Выберите дисциплину</label>
                </div>
                <Multiselect
                  options={this.state.disciplines ? this.state.disciplines : []}
                  placeholder="Дисциплины"
                  selectedValues={this.state.selectedDiscipline} 
                  onSelect={this.onSelectDiscipline} 
                  onRemove={this.onSelectDiscipline}
                  displayValue="name"
                />
              </div>
            </div>
            <div className='d-flex mt-2'>
                <img width="32" height="32" 
                onClick={this.toggleFormDisciplineVisibility}
                style={{ cursor: 'pointer', marginLeft:'5px'}}
                src="https://img.icons8.com/small/32/00abed/add.png" alt="add"/>
                <p style={{ color: "#00aeef"}}><small>Добавить дисциплину, которой нет в списке</small></p>
              </div>
              {this.state.isFormDisciplineVisible && (
                <div>
                  <input
                    type="text"
                    value={this.state.newDisciplineInput}
                    onChange={this.handleNewDisciplineInputChange}
                  />
                  <span className="lh-24" style={{ fontSize: '14px',marginLeft:'10px', cursor:'pointer', background:'#00ABED', color:'white', padding: '7px 24px', borderRadius: '20px', fontWeight: '600'}} onClick={this.addNewDisciplines}>добавить</span>
                </div>
              )}
            <div className="row mt-3">
                <div className="col">
                <label className="form-label" htmlFor="name" style={{fontWeight:'600'}}>Название проекта</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Название проекта" 
                  value={this.state.projectName} 
                  onChange={this.handleProjectNameChange} 
                />
              </div>
            </div>
            <div className="row mt-3">
              <div className="col">
                <label className="form-label" htmlFor="course" style={{fontWeight:'600'}}>Выберите навык(и)</label>
                <Multiselect
                    options={this.state.skills ? this.state.skills : []}
                    placeholder="Навыки"
                    selectedValues={this.state.selectedSkills } 
                    onSelect={this.onSelectSkill} 
                    onRemove={this.onSelectSkill}
                    displayValue="skill"
                />
              </div>
            </div>
            <div className='d-flex mt-2'>
                <img width="32" height="32" 
                onClick={this.toggleFormSkillVisibility}
                style={{ cursor: 'pointer', marginLeft:'5px'}}
                src="https://img.icons8.com/small/32/00abed/add.png" alt="add"/>
                <p style={{ color: "#00aeef"}}><small>Добавить навыки, которых нет в списке</small></p>
            </div>
            {this.state.isFormSkillVisible && (
                <div>
                    <input
                        type="text"
                        value={this.state.newTagInput}
                        onChange={this.handleNewTagInputChange}
                    />
                    <span className="lh-24" style={{ fontSize: '14px',marginLeft:'10px', cursor:'pointer', background:'#00ABED', color:'white', padding: '7px 24px', borderRadius: '20px', fontWeight: '600'}} onClick={this.addNewRequirement}>добавить</span>
                </div>
            )}

            <div className="row mt-3">
              <div className="col">
                <label className="form-label" htmlFor="name" style={{fontWeight:'600'}}>Выберите студента</label>
                <Multiselect
                    options={this.state.students ? this.state.students : []}
                    placeholder="Студенты"
                    selectedValues={this.state.selectedStudents} 
                    onSelect={this.onSelect} 
                    onRemove={this.onSelect}
                    displayValue="name"
                />
              </div>
            </div>
            <div className="row mt-3">
              <div className="col">
                <label className="form-label" htmlFor="score" style={{fontWeight:'600'}}>Введите оценку за дисциплину</label>
                <input 
                className="form-control" 
                type="number" 
                name="score" 
                value={this.state.score} 
                onChange={this.handleScoreChange}
                min='2'
                max='5' />
              </div>
            </div>
            <button className="btn btn-primary btn-sm mt-3" type="submit">Добавить</button>
          </form>
        }
      </div>
      )}
      </div>
      )}
    </AuthContext.Consumer>
    )
  }
}

export default CreateDiscipline