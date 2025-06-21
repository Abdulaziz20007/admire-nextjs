CREATE TABLE "Admin"(
    "id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "surname" VARCHAR(255) NOT NULL,
    "username" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "avatar" VARCHAR(255) NULL,
    "priority" VARCHAR(255) CHECK
        ("priority" IN('0', '1', '2', '3')) NOT NULL DEFAULT '0'
);
ALTER TABLE
    "Admin" ADD PRIMARY KEY("id");
COMMENT
ON COLUMN
    "Admin"."priority" IS '0-blocked,
1-access only to change messages (can toggle is_checked)
2-access to 1-priority and change content and can delete messages
3-access to 1,2-proprities and add admins';
CREATE TABLE "Web"(
    "id" INTEGER NOT NULL,
    "header_img" VARCHAR(255) NOT NULL,
    "header_h1_uz" VARCHAR(255) NOT NULL,
    "header_h1_en" VARCHAR(255) NOT NULL,
    "about_p1_uz" VARCHAR(255) NOT NULL,
    "about_p1_en" VARCHAR(255) NOT NULL,
    "about_p2_uz" VARCHAR(255) NOT NULL,
    "about_p2_en" VARCHAR(255) NOT NULL,
    "total_students" INTEGER NOT NULL,
    "best_students" INTEGER NOT NULL,
    "total_teachers" INTEGER NOT NULL,
    "gallery_p_uz" VARCHAR(255) NOT NULL,
    "gallery_p_en" VARCHAR(255) NOT NULL,
    "teachers_p_uz" VARCHAR(255) NOT NULL,
    "teachers_p_en" VARCHAR(255) NOT NULL,
    "students_p_uz" VARCHAR(255) NOT NULL,
    "students_p_en" VARCHAR(255) NOT NULL,
    "address_uz" VARCHAR(255) NOT NULL,
    "address_en" VARCHAR(255) NOT NULL,
    "orientation_uz" VARCHAR(255) NOT NULL,
    "orientation_en" VARCHAR(255) NOT NULL,
    "work_time" VARCHAR(255) NOT NULL,
    "work_time_sunday" VARCHAR(255) NOT NULL,
    "footer_p_uz" VARCHAR(255) NOT NULL,
    "footer_p_en" VARCHAR(255) NOT NULL,
    "main_phone_id" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "extended_address_uz" VARCHAR(255) NOT NULL,
    "extended_address_en" VARCHAR(255) NOT NULL
);
ALTER TABLE
    "Web" ADD PRIMARY KEY("id");
CREATE TABLE "Teacher"(
    "id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "surname" VARCHAR(255) NOT NULL,
    "about" VARCHAR(255) NOT NULL,
    "quote" VARCHAR(255) NOT NULL,
    "image" VARCHAR(255) NOT NULL,
    "overall" FLOAT(53) NOT NULL,
    "listening" FLOAT(53) NOT NULL,
    "reading" FLOAT(53) NOT NULL,
    "writing" FLOAT(53) NOT NULL,
    "speaking" FLOAT(53) NOT NULL,
    "cefr" VARCHAR(255) NOT NULL,
    "experience" INTEGER NOT NULL,
    "students" INTEGER NOT NULL
);
ALTER TABLE
    "Teacher" ADD PRIMARY KEY("id");
CREATE TABLE "Student"(
    "id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "surname" VARCHAR(255) NOT NULL,
    "image" VARCHAR(255) NOT NULL,
    "certificate" VARCHAR(255) NOT NULL,
    "overall" FLOAT(53) NOT NULL,
    "listening" FLOAT(53) NOT NULL,
    "reading" FLOAT(53) NOT NULL,
    "writing" FLOAT(53) NOT NULL,
    "speaking" FLOAT(53) NOT NULL,
    "cefr" VARCHAR(255) NOT NULL,
    "comment" VARCHAR(255) NOT NULL
);
ALTER TABLE
    "Student" ADD PRIMARY KEY("id");
CREATE TABLE "Media"(
    "id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" BOOLEAN NOT NULL,
    "url" VARCHAR(255) NOT NULL
);
ALTER TABLE
    "Media" ADD PRIMARY KEY("id");
COMMENT
ON COLUMN
    "Media"."type" IS 'true-video
false-image';
CREATE TABLE "Phone"(
    "id" INTEGER NOT NULL,
    "phone" VARCHAR(255) NOT NULL
);
ALTER TABLE
    "Phone" ADD PRIMARY KEY("id");
CREATE TABLE "WebPhone"(
    "id" INTEGER NOT NULL,
    "web_id" INTEGER NOT NULL,
    "phone_id" INTEGER NOT NULL
);
ALTER TABLE
    "WebPhone" ADD PRIMARY KEY("id");
CREATE TABLE "WebMedia"(
    "id" INTEGER NOT NULL,
    "alt" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "category" VARCHAR(255) NOT NULL,
    "size" VARCHAR(255) CHECK
        ("size" IN('1x1', '1x2')) NOT NULL DEFAULT '1x1',
        "web_id" INTEGER NOT NULL,
        "media_id" INTEGER NOT NULL
);
ALTER TABLE
    "WebMedia" ADD PRIMARY KEY("id");
CREATE TABLE "WebStudent"(
    "id" INTEGER NOT NULL,
    "web_id" INTEGER NOT NULL,
    "student_id" INTEGER NOT NULL
);
ALTER TABLE
    "WebStudent" ADD PRIMARY KEY("id");
CREATE TABLE "WebTeacher"(
    "id" INTEGER NOT NULL,
    "web_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL
);
ALTER TABLE
    "WebTeacher" ADD PRIMARY KEY("id");
CREATE TABLE "Message"(
    "id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(255) NOT NULL,
    "message" VARCHAR(255) NOT NULL,
    "is_checked" BOOLEAN NOT NULL DEFAULT '0',
    "updated_admin_id" INTEGER NOT NULL,
    "is_telegram" BOOLEAN NOT NULL DEFAULT '0'
);
ALTER TABLE
    "Message" ADD PRIMARY KEY("id");
CREATE TABLE "Social"(
    "id" INTEGER NOT NULL,
    "icon_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL
);
ALTER TABLE
    "Social" ADD PRIMARY KEY("id");
CREATE TABLE "WebSocial"(
    "id" INTEGER NOT NULL,
    "web_id" INTEGER NOT NULL,
    "social_id" INTEGER NOT NULL
);
ALTER TABLE
    "WebSocial" ADD PRIMARY KEY("id");
CREATE TABLE "Icon"(
    "id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "url" VARCHAR(255) NOT NULL
);
ALTER TABLE
    "Icon" ADD PRIMARY KEY("id");
ALTER TABLE
    "WebPhone" ADD CONSTRAINT "webphone_phone_id_foreign" FOREIGN KEY("phone_id") REFERENCES "Phone"("id");
ALTER TABLE
    "WebPhone" ADD CONSTRAINT "webphone_web_id_foreign" FOREIGN KEY("web_id") REFERENCES "Web"("id");
ALTER TABLE
    "WebStudent" ADD CONSTRAINT "webstudent_web_id_foreign" FOREIGN KEY("web_id") REFERENCES "Web"("id");
ALTER TABLE
    "WebMedia" ADD CONSTRAINT "webmedia_web_id_foreign" FOREIGN KEY("web_id") REFERENCES "Web"("id");
ALTER TABLE
    "WebTeacher" ADD CONSTRAINT "webteacher_teacher_id_foreign" FOREIGN KEY("teacher_id") REFERENCES "Teacher"("id");
ALTER TABLE
    "WebSocial" ADD CONSTRAINT "websocial_social_id_foreign" FOREIGN KEY("social_id") REFERENCES "Social"("id");
ALTER TABLE
    "WebStudent" ADD CONSTRAINT "webstudent_student_id_foreign" FOREIGN KEY("student_id") REFERENCES "Student"("id");
ALTER TABLE
    "Social" ADD CONSTRAINT "social_icon_id_foreign" FOREIGN KEY("icon_id") REFERENCES "Icon"("id");
ALTER TABLE
    "WebSocial" ADD CONSTRAINT "websocial_web_id_foreign" FOREIGN KEY("web_id") REFERENCES "Web"("id");
ALTER TABLE
    "WebTeacher" ADD CONSTRAINT "webteacher_web_id_foreign" FOREIGN KEY("web_id") REFERENCES "Web"("id");
ALTER TABLE
    "Message" ADD CONSTRAINT "message_updated_admin_id_foreign" FOREIGN KEY("updated_admin_id") REFERENCES "Admin"("id");
ALTER TABLE
    "WebMedia" ADD CONSTRAINT "webmedia_media_id_foreign" FOREIGN KEY("media_id") REFERENCES "Media"("id");