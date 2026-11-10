-- Fluxos persistentes de simulados, respostas abertas e planejamento individual.
CREATE TABLE IF NOT EXISTS user_simulation_sessions (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id INT NOT NULL,
  vestibular_id VARCHAR(40) NOT NULL,
  question_refs_json LONGTEXT NOT NULL,
  settings_json TEXT NOT NULL,
  answers_json LONGTEXT NULL,
  result_json LONGTEXT NULL,
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  submitted_at DATETIME NULL,
  INDEX idx_simulation_user_date (user_id, started_at),
  CONSTRAINT fk_simulation_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_open_question_responses (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  question_ref VARCHAR(190) NOT NULL,
  simulation_id CHAR(36) NULL,
  response_text LONGTEXT NOT NULL,
  review_status VARCHAR(30) NOT NULL DEFAULT 'pending',
  reviewer_feedback LONGTEXT NULL,
  score DECIMAL(5,2) NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_open_response_user_question_sim (user_id, question_ref, simulation_id),
  INDEX idx_open_response_user (user_id, updated_at),
  CONSTRAINT fk_open_response_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_study_plans (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(180) NOT NULL,
  target_exam VARCHAR(60) NOT NULL,
  target_course VARCHAR(180) NULL,
  target_date DATE NULL,
  weekly_hours DECIMAL(5,2) NOT NULL DEFAULT 10,
  availability_json TEXT NOT NULL,
  subjects_json TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_study_plan_user (user_id),
  CONSTRAINT fk_study_plan_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_study_tasks (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plan_id BIGINT NOT NULL,
  title VARCHAR(220) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  topic VARCHAR(180) NULL,
  task_date DATE NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 45,
  priority VARCHAR(20) NOT NULL DEFAULT 'normal',
  task_type VARCHAR(30) NOT NULL DEFAULT 'study',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  notes TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_study_tasks_user_date (user_id, task_date),
  CONSTRAINT fk_study_task_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_study_task_plan FOREIGN KEY (plan_id) REFERENCES user_study_plans(id) ON DELETE CASCADE
);
