import React, { Component } from 'react';
import SearchBar from './SearchBar';
import axios from 'axios';
import AuthContext from './AuthContext';
import { jwtDecode } from 'jwt-decode';
import { API_URL } from '..';
import 'bootstrap/dist/css/bootstrap.min.css';

export class StudentsPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            students: [], // десь хранятся все студенты
            
            studentsIsWork: [], // здесь будут храниться студенты, которые задействованы в проектах
            searchQuery: '', // здесь будет храниться запрос пользователя

            studentsData: [],
            selectedStudent: null,

            is_user:null,
            skillStudent:[]
        };

        this.setState = this.setState.bind(this); // привязываем this к методам
        this.toggleColor = this.toggleColor.bind(this); // привязываем this к методу toggleColor
        
    }

    componentDidMount() {
        const authTokens = JSON.parse(localStorage.getItem('authTokens'));
        if (authTokens) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${authTokens.access}`;
            const decodedUser = jwtDecode(authTokens.access);
            this.fetchUserData(decodedUser.user_id);
            Promise.all([
                fetch(`${API_URL}/students`),
                fetch(`${API_URL}/skill`),
                fetch(`${API_URL}/filter/student/team`),
            ])
            .then(([res1, res2, res3]) => Promise.all([res1.json(), res2.json(), res3.json()]))
            .then(([data1, data2, data3]) => {
                this.setState({
                    students: data1,
                    skillStudent: data2,
                    studentsIsWork: data3,
                });
            });
        }
        
    }

    toggleColor = (event) => {
        this.setState({ isChecked: event.target.checked }); 
    };

    fetchUserData = async (user_id) => {
        try {
          const userResponse = await axios.get(`${API_URL}/user/${user_id}`)
          this.setState({
            is_user: userResponse.data,
          });
        } catch (error) {
          console.error('Ошибка при получении пользовательских данных:', error);
        }
    };

    openModal = (student) => {
        this.setState({ selectedStudent: student});
        // console.log(this.state.selectedStudent);
    };

    closeModal = () => {
        this.setState({ selectedStudent: null});
    };

  render() {
    const currentStudents = this.state.students;
    const searchValue = this.props.searchValue;
    const setSearchValue = this.props.setSearchValue;

    const { is_user } = this.state;

    if ( !is_user) {
      return <div className='container'></div>
    }

    return (
    <AuthContext.Consumer>
        {({ user }) => (
        <div>
            <div className='container'>
                <div className='pt-30'>
                    <h1 className=" m-0" style={{color: '#00AEEF'}}>Студенты</h1>  
                </div>
                <div className='flex jc-sb mt-3'> 
                    <div style={{flexGrow: 1}}>
                        <p style={{fontWeight: '600'}}>Поиск студента:</p>
                        <SearchBar searchValue={searchValue} setSearchValue={setSearchValue} /> 
                    </div>
                </div>
                <div className='flex mt-3 justify-content-between'>
                    <div className='d-flex'>
                        <p style={{fontWeight: '600'}}>Cтуденты, задействованные в проектах:</p>
                        <label className="switch" style={{color: 'rgb(78, 77, 77)'}} >
                            <input 
                            type="checkbox" 
                            name="PROP_DESK" 
                            value="N" 
                            onChange={this.toggleColor}
                            checked={this.state.isChecked}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                    {user && !is_user.is_student ? (
                        <div className='justify-content-between'>
                            <a data-fancybox="" data-src="#auth" href="/user" className="update-proj" >Добавить пользователя</a>
                            <a href="/edit-user"><img width="37" height="37" src="https://img.icons8.com/ios/50/edit-user-male.png" alt="edit-user-male" className='button' style={{marginLeft:'10px'}}/></a>
                        </div>
                    ) :  null }
                </div>
                {this.state.isChecked ? (
                    <div className="row mt-5">
                        {this.state.studentsIsWork.filter(student => {
                            if (student.name.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())) {
                                return true;
                            }
                            return false;
                        }).map((student, index) => 
                        <div key={index} className="card_up col-12 col-sm-6 col-lg-3">
                            <div className="single_advisor_profile wow fadeInUp" data-wow-delay="0.3s" onClick={() => this.openModal(student)} style={{visibility: 'visible', animationDelay: '0.3s', animationName: 'fadeInUp'}}>
                            <div className="advisor_thumb"><img width="261" height="230" src="https://rsv.ru/account/img/placeHolder-m.4c1254a5.png" alt=""/>
                                <div className="social-info" style={{fontStyle: 'normal', fontWeight: '400', fontSize: '.93375rem', lineHeight: '1.34875rem'}}>Статус: <span style={{color: 'rgb(104, 200, 122)'}}> Участник
                                    </span>
                                </div>
                            </div>
                            <div className="single_advisor_details_info" data-bs-toggle="modal" data-bs-target="#exampleModal" style={{cursor:'pointer'}}>
                                <h6>{student.name}</h6>
                                <p className="designation">Студент {student.course} курса</p>
                            </div>
                            </div>
                        </div>
                    )}
                </div>
                ) : (
                <div className="row mt-5">
                    {currentStudents.filter(student => {
                            if (student.name.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase())) {
                                return true;
                            }
                            return false;
                        }).map((student, index) => 
                        <div key={index} className="card_up col-12 col-sm-6 col-lg-3">
                            <div className="single_advisor_profile wow fadeInUp"  onClick={() => this.openModal(student)} data-wow-delay="0.3s" style={{visibility: 'visible', animationDelay: '0.3s', animationName: 'fadeInUp'}}>
                            <div className="advisor_thumb"><img width="261" height="230" src="https://rsv.ru/account/img/placeHolder-m.4c1254a5.png" alt=""/>
                                {student.projects.length === 0 ? (
                                    <div className="social-info" style={{fontStyle: 'normal', fontWeight: '400', fontSize: '.93375rem', lineHeight: '1.34875rem'}}>Статус: <span style={{color: '#ef627d'}}> Не участник</span>
                                    </div>
                                ) : (
                                    <div className="social-info" style={{fontStyle: 'normal', fontWeight: '400', fontSize: '.93375rem', lineHeight: '1.34875rem'}}>Статус: <span style={{color: 'rgb(104, 200, 122)'}}> Участник
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="single_advisor_details_info" data-bs-toggle="modal" data-bs-target="#exampleModal" style={{cursor:'pointer'}}>
                                <h6>{student.name}</h6>
                                <p className="designation">Студент {student.course} курса</p>
                            </div>
                            </div>
                        </div>
                    )}
                    {this.state.selectedStudent && (
                        <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h1 className="modal-title fs-5" id="exampleModalLabel">Информация о студенте</h1>
                                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Закрыть" onClick={this.closeModal}></button>
                                    </div>
                                    <div className="modal-body">
                                        <h2>{this.state.selectedStudent.name}</h2>
                                        <p>{this.state.selectedStudent.direction}</p>
                                        <p style={{color: '#4E4D4D', fontWeight: '700', lineHeight:'30px', marginBottom: '0'}}>Проект</p>
                                        <div>
                                            {this.state.selectedStudent.projects.map((obj, index) => (
                                                <h1 className='modal-title fs-5' key={index}>{obj.title}</h1>
                                            ))}
                                        </div>
                                        <p style={{color: '#4E4D4D', fontWeight: '700', lineHeight:'30px', marginBottom: '0'}}>Навыки</p>
                                        <div>
                                            {this.state.selectedStudent.skills.map((skill, index) => (
                                                <span key={index} className='info-team'> {skill.skill} </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                )}
            </div>
        </div>
        )}
    </AuthContext.Consumer>
    );
  }
}

export default StudentsPage