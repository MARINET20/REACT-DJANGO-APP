import React, { Component } from 'react'
import { CProgressBar, CProgress } from '@coreui/bootstrap-react'
import { API_URL } from '../..';
import {
    useNavigate ,
} from "react-router-dom";

export class SearchTeamLastPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            students: null,
            skills: null,
            teamsArray: [],
            skillIds: [],
            activeSlideIndex: 0, // Индекс активного слайда
            formData: {
                project_id: null,
                studentIds: null
            },
        };
    }

    componentDidMount() {
        Promise.all([
            fetch(`${API_URL}/students`),
            fetch(`${API_URL}/skill`)
        ])
        .then(([res1, res2]) => Promise.all([res1.json(), res2.json()]))
        .then(([data1, data2]) => {
            this.setState({
                students: data1,
                skills: data2,
                teamsArray: this.props.teams.data, 
                skillIds: this.props.teams.data[0].skillIds
            });
        });
    }

    handleSlideChange = (index) => {
        this.setState({ activeSlideIndex: index });
    }

    handleSelectTeam = async () => {
        const selectedTeam = this.state.teamsArray[this.state.activeSlideIndex];
        // Здесь можно вызвать метод и передать информацию о выбранной команде
        const { formData } = this.state;
        formData.studentIds = selectedTeam.studentIds; 
        formData.project_id =  this.props.project_id;
        this.setState({ formData });
        const { history } = useNavigate;

        try {
            const response = await fetch(`${API_URL}/add-team-db`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.state.formData),
            });

            if (response.ok) {
                const data = await response.json();
                alert('Команда успешно добавлена!');
                history('/projects')
            } else {
                const data = await response.json();
                alert('Ошибка при добавления команды');
            }

        } catch (error) {
            this.setState({ error: 'Ошибка при отправке данных', message: null });
            alert('Ошибка при отправке данных');
        }
    }

  render() {
    const { activeSlideIndex } = this.state;
    return (
      <div>
        { this.state.teamsArray.length === 0 ? (
            <div>
                <div className='pt-30 d-flex'>
                    <h1 className=" m-0">Идет поиск команды...</h1>  
                    {/* <img width="60" height="60" src="https://img.icons8.com/ios-glyphs/90/00abed/sad.png" alt="sad"/> */}
                </div>
            </div>
        ):(
        <div>
            <div className='pt-30'>
                <h1 className=" m-0" style={{color: '#00AEEF'}}>Ваша команда</h1>  
            </div>
            
            <div id="carouselExampleControls" className="carousel carousel-dark slide mt-3" data-bs-ride="carousel">
                <div className="carousel-inner">
                    {this.state.teamsArray.map((teamInfo, index) => (
                        <div key={index} className={`carousel-item ${index === activeSlideIndex ? 'active' : ''}`}>
                            <div className="d-flex justify-content-center mt-5">
                            {teamInfo.studentIds.map((studentId, studentIndex) => {
                                const student = this.state.students.find(student => student.id === studentId);
                                return (
                                    <div key={index} className="card_up col-12 col-sm-6 col-lg-3" >
                                        <div className="single_advisor_profile wow fadeInUp" data-wow-delay="0.3s" style={{visibility: 'visible', animationDelay: '0.3s', animationName: 'fadeInUp'}}>
                                        <div className="advisor_thumb"><img width="261" height="230" src="https://rsv.ru/account/img/placeHolder-m.4c1254a5.png" alt=""/>
                                        </div>
                                        <div className="single_advisor_details_info" data-bs-toggle="modal" data-bs-target="#exampleModal" style={{cursor:'pointer'}}>
                                            <h6>{student.name}</h6>
                                            <p className="designation">{student.direction}</p>
                                        </div>
                                        </div>
                                    </div>
                                )   
                            })}
                            </div>

                            {teamInfo.skillIds.map((skillId, skillIndex) => {
                                const skill = this.state.skills.find(skill => skill.id === skillId);
                                let score = teamInfo.score[skillId];
                                if (score >= 2 && score <= 5) {
                                    score = (score - 1) * 25; // Преобразование в проценты (2 = 25%, 3 = 50%, 4 = 75%, 5 = 100%)
                                } else {
                                    score = 0;
                                }
                                const value = score
                                return (
                                    <div key={skillIndex}>
                                        <p style={{fontWeight: '600', padding:'5px'}}>{skill.skill}: {value}%</p>
                                        <CProgress height={30} >
                                            <CProgressBar value={value} color="dark" variant="striped"/>
                                        </CProgress>
                                    </div> 
                                );
                            })}
                        </div>
                    ))}
                </div>
                <button onClick={() => this.handleSlideChange(activeSlideIndex - 1)}  className="carousel-control-prev" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                </button>
                <button onClick={() => this.handleSlideChange(activeSlideIndex + 1)}  className="carousel-control-next" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                </button>
            </div>
            <button
                className="btn-next mt-3"
                onClick={this.handleSelectTeam}
            >Выбрать&nbsp;команду</button>
        </div>)}
      </div>
    )
  }
}

export default SearchTeamLastPage