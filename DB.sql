create database if not exists Capvest;
use Capvest;

create table users #1

(
	id INT not null auto_increment, #Identificador único
    name VARCHAR(150) not null, #Nome completo
    username VARCHAR(50) unique, #Nome de usuário
    email  VARCHAR(255) unique, #E-mail de login
    password_hash VARCHAR(255) not null, #Senha criptografada
    avatar_url	TEXT null, #Foto de perfil
    bio TEXT null, #Biografia
    city VARCHAR(100) null, #cidade
    school VARCHAR(200) null, #Escola
    education_level VARCHAR(100) null, #Nível de ensino
	created_at DATETIME not null, #Data de cadastro
	updated_at	DATETIME not null, #Última atualização
    
    primary key(id)

);


create table user_profiles #2

(
	id INT not null auto_increment, #Identificador
    user_id INT not null, #Usuário
    university VARCHAR(200) null, #Universidade desejada
    course  VARCHAR(200) null, #Curso desejado
    target_exam VARCHAR(100) null, #Vestibular
    target_year INT null, #Ano do vestibular
    entry_year INT  null, #Ano pretendido de entrada
    primary key(id),
    constraint fk1 foreign key(user_id) references users(id)
    
);


create table user_progress #3

(
	user_id INT not null, #Usuário
    xp INT not null, #XP atual
    level INT not null, #Nível atual
    xp_next_level  INT not null, #XP necessário para próximo nível
    title VARCHAR(100) null, #Título do usuário
    current_streak INT default 0, #Sequência atual
	longest_streak INT  default 0, #Maior sequência
    updated_at DATETIME NOT NULL, #Atualização
    
    primary key(user_id),
    constraint fk2 foreign key(user_id) references users(id)
    
);



create table user_statistics #4

(
	user_id INT not null, #Usuário
	questions_answered INT default 0, #Questões respondidas
    simulations_completed INT  default 0, #Simulados realizados
	essays_submitted INT  default 0, #Redações enviadas
    study_hours DECIMAL  default 0, #Horas estudadas
    current_streak INT  default 0, #Sequência atual
    accuracy DECIMAL(5,2)  default 0, #Porcentagem de acerto
    updated_at DATETIME not null, #Atualização
    
    primary key(user_id),
    constraint fk3 foreign key(user_id) references users(id)
    
);

create table user_goals #5

(
	id INT not null auto_increment, #Identificador
	user_id INT not null, #Usuário
	university VARCHAR(200) null, #Universidade 
    course  VARCHAR(200) null, #Curso 
    exam VARCHAR(100) null, #Vestibular
    exam_year INT null, #Ano
    progress DECIMAL(5,2) default 0, #Progresso
    target_date  DATE null, #Data da prova
    active BOOLEAN default true, #Objetivo atual
    created_at  DATETIME not null, #Data de criação
    
    primary key(id),
    constraint fk4 foreign key(user_id) references users(id)
    
);
    

create table subjects #6

(
	id INT not null auto_increment, #Identificador
    name VARCHAR(100) not null, #Nome da matéria
    slug VARCHAR(100) UNIQUE, #Identificador
    description TEXT null, #Descrição
    course  VARCHAR(200) null, #Curso 
    icon VARCHAR(100) null, #Ícone
   
    
    primary key(id)

);

create table topics #7

(
	id INT not null auto_increment, #Identificador
    subject_id INT not null, #Matéria
    name VARCHAR(150) not null, #Nome do tema
    description TEXT null, #Descrição
   
    
    primary key(id),
	constraint fk5 foreign key(subject_id) references subjects(id)
);

create table exams #8

(
	id INT not null auto_increment, #Identificador
    name VARCHAR(150) not null, #Nome
    institution VARCHAR(150) null, #Instituição
    year INT null, #Ano
    description TEXT null, #Descrição
    logo_url  TEXT null, #Logo
   
    
    primary key(id)
);

create table questions #9

(
	id INT not null auto_increment, #Identificador
    exam_id INT not null, #Vestibular
    subject_id INT not null, #Matéria
    topic_id INT not null, #Tema
    year INT null, #Ano
    difficulty VARCHAR(30) null, #Fácil/Médio/Difícil
    statement TEXT not null, #Enunciado
	image_url TEXT  null, #Imagem
    explanation TEXT  null, #Explicação da resposta
    source VARCHAR(255)  null, #Fonte
    created_at DATETIME  not null, #Data de criação
    
    primary key(id),
    
	constraint fk6 foreign key(exam_id) references  exams(id),
    constraint fk7 foreign key(subject_id) references subjects(id),
    constraint fk8 foreign key(topic_id) references  topics(id)
);

create table question_options #10

(
	id INT not null auto_increment, #Identificador
    question_id INT not null, #Questão
    letter CHAR(1) not null, #A/B/C/D/E
    text TEXT not null, #Texto da alternativa
    is_correct BOOLEAN not null, #Alternativa correta
   
    constraint fk9 foreign key(question_id) references  questions(id),
    primary key(id)
);

create table user_question_answers #11

(
	id INT not null auto_increment, #Identificador
    user_id INT not null, #Usuário
    question_id INT not null, #Questão
    selected_option_id INT not null, #Alternativa escolhida
    is_correct BOOLEAN not null, #Se acertou
    answered_at  DATETIME not null, #Data/hora
    time_spent  INT null, #Tempo em segundos
    constraint fk10 foreign key(user_id) references  users(id),
    constraint fk11 foreign key(question_id) references  questions(id),
    constraint fk12 foreign key(selected_option_id) references  question_options(id),
    primary key(id)
);

create table user_subject_progress #12

(
	user_id INT not null, #Usuário
    subject_id INT not null, #Matéria
    questions_answered INT not null default 0 , #Questões respondidas
    correct_answers INT not null default 0 , #Acertos
	accuracy DECIMAL(5,2) default 0 , #Aproveitamento
    study_hours DECIMAL default 0 , #Horas estudadas
    progress DECIMAL(5,2) default 0 , #Progresso

    constraint fk13 foreign key(user_id) references  users(id),
    constraint fk14 foreign key(subject_id) references  subjects(id)
);

create table simulations #13

(
	id INT not null, #Identificador
    title VARCHAR(200) not null, #Nome
    description TEXT null , #Descrição
    exam_id INT not null , #Vestibular
    duration INT null, #Duração em minutos
    question_count INT default 0, #Número de questões
    created_at DATETIME not null, #Criação
    
    constraint fk15 foreign key(exam_id) references  exams(id),
    primary key(id)
);

create table simulation_questions #14

(
	simulation_id INT not null, #Simulado
    question_id INT not null, #Questão
    ordem INT not null , #Ordem da questão
    
    constraint fk16 foreign key(simulation_id) references simulations(id),
    constraint fk17 foreign key(question_id) references questions(id)
);


create table user_simulation #15

(
	id INT not null, #Identificador
    user_id INT not null, #Usuário
	simulation_id  INT not null , #Simulado
	started_at DATETIME null, #Início
    finished_at DATETIME null, #Final
    score DECIMAL(8,2) null, #Pontuação
    correct_answers INT DEFAULT 0, #Acertos
    wrong_answers INT DEFAULT 0, #Erros
    
	constraint fk18 foreign key(simulation_id) references simulations(id),
	constraint fk19 foreign key(user_id) references  users(id),
    primary key(id)
);

create table essays #16

(
	id INT not null, #Identificador
    user_id INT not null, #Usuário
	title  VARCHAR(200)  null , #Título
	theme VARCHAR(255) not null, #Tema
    content LONGTEXT null, #Texto
    score DECIMAL(5,2) null, #Nota
    status VARCHAR(30) not null, #Rascunho/enviada/Corrigida
    created_at DATETIME not null, #Criação
    corrected_at DATETIME null, #Data da Correçãp
    
    constraint fk20 foreign key(user_id) references  users(id),
    primary key(id)
);

create table study_sessions #17

(
	id INT not null, #Identificador
    user_id INT not null, #Usuário
	subject_id  INT not  null , #Matéria
	started_at DATETIME not null, #Início
    finished_at DATETIME  null, #Fim
    duration_minutes INT  null, #Duração
    activity_type  VARCHAR(50) null, #Tipo da atividade
    
    constraint fk21 foreign key(user_id) references  users(id),
	constraint fk22 foreign key(subject_id) references  subjects(id),
    primary key(id)
);

create table study_calendar #18
(
	id INT not null, #Identificador
	user_id INT not null, #Usuário
    date DATE not null, #Data
    subject_id INT not null, #Matéria
    title VARCHAR(200) not null, #Nome Da Atividade
    description TEXT null, #Descrição
    type VARCHAR(50) null, #Tipo
    duration INT null, #Duração em minutos
    completed boolean default false, #Concluído
    
    constraint fk23 foreign key(user_id) references  users(id),
	constraint fk24 foreign key(subject_id) references  subjects(id),
    primary key(id)
);

create table achievements #19
(
	id INT not null, #Identificador
	name VARCHAR(150) not null, #Nome
    description TEXT  null, #Descrição
    icon VARCHAR(100) null, #Ícone
    xp_reward INT default 0, #XP recebido
    requirement TEXT null, #requisito
    
    primary key(id)
);

create table user_achievements #20
(
	user_id INT not null, #Usuário
    achievement_id INT not null, #Conquista
    unlocked_at DATETIME not null, #Data do desbloqueio
    
    constraint fk25 foreign key(user_id) references  users(id),
	constraint fk26 foreign key(achievement_id) references  achievements(id),
    primary key(user_id)
);

create table news #21
(
	id INT not null, #Identificador
	title VARCHAR(255) not null, #Título
    description TEXT  null, #Resumo
	content LONGTEXT null, #Conteúdo
    image_url TEXT null, #Imagem
    category VARCHAR(100) null, #Categoria
    author VARCHAR(150) null, #Autor
    published_at DATETIME null, #Publicação
    created_at DATETIME not null, #Criação
    
    primary key(id)
);

create table events #22
(
	id INT not null, #Identificador
	title VARCHAR(255) not null, #Título
    description TEXT  null, #Resumo
	date DATE not null, #Data
    time TIME null, #Horário
    location VARCHAR(255) null, #Local
    image_url TEXT null, #Imagem
    type VARCHAR(100) null, #Tipo
    link TEXT  null, #Link externo
    
    primary key(id)
);

create table user_ranking #23
(
	user_id INT not null, #Usuário
	score DECIMAL(12,2) default 0, #Pontuação
	state VARCHAR(100) null, #Estado
    school VARCHAR(200) null, #Escola
    updated_at DATETIME not null, #Atualização
    
	constraint fk27 foreign key(user_id) references  users(id),
    primary key(user_id)
);

create table user_last_activity #24
(
	user_id INT not null, #Usuário
	activity_type VARCHAR(50) null, #Tipo da Atividade
	reference_id INT null, #ID da atividade
    title VARCHAR(255) null, #Nome
    progress DECIMAL(5,2) default 0, #Progresso
    updated_at DATETIME not null, #Atualização
    
	constraint fk28 foreign key(user_id) references  users(id),
    primary key(user_id)
);
