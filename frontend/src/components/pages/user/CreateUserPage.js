import React, { Component } from 'react'
import * as XLSX from 'xlsx';
import { API_URL } from '../../..';


export class CreateUserPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
        userType: 'student',
        formData: {
            name: null,
            course: null,
            email: null,
            direction: null
        },
        formDataFile: {
            direction: [],
            student:[],
            email:[],
            is_course: [],
            is_student: []
        },
        dataLoaded: false,
        isStudent: null,
        nameDiscipline: null,
        course: null
    };
  }

    handleUserTypeChange = (e) => {
        this.setState({ userType: e.target.value });
    }

    handleChange = (e) => {
        const { name, value } = e.target;
        this.setState(prevState => ({
            formData: {
                ...prevState.formData,
                [name]: value
            }
        }));
    }

    handleStudentChange = (event) => {
        const { value } = event.target;
        this.setState({ course: value });
    }

    handleUserChange = (e) => {
        const value = e.target.value === 'student' ? true : false;
        this.setState({ isStudent: value });
    }

    handleSubmit = async (e) => {
        e.preventDefault();
        console.log(this.state.formData);
        try {
            const response = await fetch(`${API_URL}/addUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.state.formData),
            });
            if (response.ok) {
                const data = await response.json();
                alert('Пользователь успешно добавлен');

                // Очистка полей после успешной отправки
                this.setState({
                    formData: {
                        name: '',
                        course: '',
                        email: '',
                        direction: ''
                    },
                });
            } else {
                const data = await response.json();
                alert(data.error);
            }
        } catch (error) {
            console.log(error)
            alert('Ошибка при отправке данных');
        }
    }

    handleSubmitFile = async (e) => {
        e.preventDefault();

        const is_student_email = this.state.formDataFile[0].email.endsWith('@study.utmn.ru');
        if (!this.state.isStudent && is_student_email) {
            alert('Не совпадает тип пользователя с почтой!');
        }
        

        const requestBody = {
            direction: this.state.nameDiscipline,
            is_student: this.state.isStudent,
            is_course: this.state.course,
            email:  this.state.formDataFile.map(data => data.email),
            name: this.state.formDataFile.map(data => data.name)
        };
    
        try {
            const response = await fetch(`${API_URL}/add-user-file`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });
    
            if (response.ok) {
                const data = await response.json();
                this.setState({ message: data.message, error: null });
                alert('Пользователи успешно добавлены!');
            } else {
                const data = await response.json();
                this.setState({ error: data.error, message: null });
                alert('Заполните все поля!');
            }
        } catch (error) {
            this.setState({ error: "Ошибка при добавлении пользователя", message: null });
            alert('Ошибка при добавлении пользователя!');
            console.error(this.state.error);
        }
    }

    handleFileUpload = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws, { header: 1 }).slice(1);
            const [header, ...rows] = data;

            const formDataStud = ['Обучающийся', 'Электронная почта', 'Направление подготовки'].map(name => header.indexOf(name));
            const [name, email, direction] = formDataStud;
            const formDataFile = rows.map(row => ({
                name: row[name],
                email: row[email],
                direction: row[direction],
            }));
            this.setState({ formDataFile, dataLoaded: true, nameDiscipline: formDataFile[0].direction });
        };
        reader.readAsBinaryString(file);

    }
  render() {
    return (
        <div className='container'>
            <div className='pt-30 d-flex mt-3 justify-content-between'>
                <h1 className=" m-0"  style={{color: '#00AEEF'}}>Добавление пользователя</h1>  
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
            </div>
            {this.state.dataLoaded && (
            <div>
                <form onSubmit={this.handleSubmitFile} className='mt-3'>
                    <div className="row mt-3">
                        <div className="col">
                            <label className="form-label" htmlFor="course" style={{fontWeight:'600'}}>Выберите тип пользователя</label>
                            <div style={{ fontSize: '.93375rem', lineHeight: '1.14125rem'}}>
                                <div>
                                    <input type="radio" id="student" name="drone" value="student" onChange={this.handleUserChange}/>
                                    <label htmlFor="student" style={{marginLeft:"5px"}}>Студент</label>
                                    <span> | </span>
                                    <input type="radio" id="teacher" name="drone" value="teacher" onChange={this.handleUserChange}/>                            
                                    <label htmlFor="teacher" style={{marginLeft:"5px"}}>Преподаватель</label>
                                </div>
                            </div>
                            {this.state.isStudent && (
                                <div>
                                    <div className="row mt-4">
                                        <div className="col">
                                            <label className="form-label" htmlFor="name" style={{fontWeight:'600'}}>Направление обучения</label>
                                            <input 
                                            className="form-control" 
                                            type="text" 
                                            name="name" 
                                            value={this.state.nameDiscipline} 
                                            />
                                        </div>
                                    </div>
                                    <div className="row mt-4">
                                        <div className="col">
                                            <label className="form-label" htmlFor="course" style={{fontWeight:'600'}}>Введите курс обучения (2-6 курс)</label>
                                            <input 
                                                className="form-control" 
                                                type="text" 
                                                name="course" 
                                                min = '2'
                                                max = '6'
                                                value={this.state.formDataFile.course}
                                                onChange={this.handleStudentChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="row mt-3">
                        <div className="col">
                        <label className="form-label" htmlFor="course" style={{fontWeight:'600'}}>Пользователи</label>
                        <br/>
                        {this.state.formDataFile.map((data, index) => (
                            <span 
                            className="info-team"
                            key={index}>{data.name} - почта: {data.email}</span>
                        ))}
                        </div>
                    </div>
                    <button className="btn btn-primary btn-sm mt-3" type="submit">Добавить</button>
                </form>
            </div>
            )}
            {!this.state.dataLoaded && (
            <form className='mt-3' onSubmit={this.handleSubmit}>
                <div className="row mt-2">
                    <div className="col">
                        <label className="form-label" style={{fontWeight:'600'}}>Выберите тип пользователя:</label>
                        <select 
                            className="form-select" 
                            value={this.state.userType} 
                            onChange={this.handleUserTypeChange}
                        >
                            <option value="student">Студент</option>
                            <option value="teacher">Преподаватель</option>
                        </select>
                    </div>
                </div>
                <div className="row mt-3">
                    <div className="col">
                        <label className="form-label" htmlFor="name" style={{fontWeight:'600'}}>ФИО</label>
                        <input className="form-control" type="text" name="name" value={this.state.formData.name} onChange={this.handleChange} />
                    </div>
                </div>
                {this.state.userType === 'student' && (
                    <div>
                        <div className="row mt-3">
                            <div className="col">
                                <label className="form-label" htmlFor="direction" style={{fontWeight:'600'}}>Направление обучения</label>
                                <input className="form-control" type="text" name="direction" value={this.state.formData.direction} onChange={this.handleChange} />
                            </div>
                        </div>
                        <div className="row mt-2">
                            <div className="col">
                                <label className="form-label" htmlFor="course" style={{fontWeight:'600'}}>Курс обучения (2-6 курс)</label>
                                <input 
                                    className="form-control" 
                                    type="text" 
                                    name="course" 
                                    min = '2'
                                    max = '6'
                                    value={this.state.formData.course}
                                    onChange={this.handleChange}
                                />
                            </div>
                        </div>
                    </div>
                )}
                <div className="row mt-2">
                    <div className="col">
                        <label className="form-label" htmlFor="email" style={{fontWeight:'600'}}>Почта</label>
                        <input className="form-control" type="text" name="email" value={this.state.formData.email} onChange={this.handleChange}/>
                    </div>
                </div>
                <button className="btn btn-primary btn-sm mt-3" type="submit">Добавить</button>
            </form>
            )}
        </div>
    )
  }
}

export default CreateUserPage;