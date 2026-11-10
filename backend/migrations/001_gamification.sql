CREATE TABLE IF NOT EXISTS user_gamification (
  user_id INT NOT NULL PRIMARY KEY,
  xp INT NOT NULL DEFAULT 0,
  questions_answered INT NOT NULL DEFAULT 0,
  correct_answers INT NOT NULL DEFAULT 0,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  last_activity_date DATE NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_gamification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_question_attempts (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  question_ref VARCHAR(190) NOT NULL,
  selected_choice VARCHAR(20) NULL,
  is_correct BOOLEAN NULL,
  xp_earned INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_attempt_user_date (user_id, created_at),
  CONSTRAINT fk_attempt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS user_exam_submissions (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  document_id VARCHAR(190) NOT NULL,
  answers_json LONGTEXT NOT NULL,
  submitted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_exam_submission_user (user_id, submitted_at),
  CONSTRAINT fk_exam_submission_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS user_question_rewards (
  user_id INT NOT NULL,
  question_ref VARCHAR(190) NOT NULL,
  rewarded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, question_ref),
  CONSTRAINT fk_question_reward_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
