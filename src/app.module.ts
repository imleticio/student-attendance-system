import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { join } from 'path';

import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SubjectsModule } from './subjects/subjects.module';
import { CoursesModule } from './courses/courses.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { ClassesModule } from './classes/classes.module';
import { AttendancesModule } from './attendances/attendances.module';
import { AttendanceSessionsModule } from './attendance-sessions/attendance-sessions.module';
import { InstitutionsModule } from './institutions/institutions.module';



@Module({
  imports: [ ConfigModule.forRoot(),
    

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,      
      autoLoadEntities: true,
      synchronize: true,
    }),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname,'..','public'), 
    }),
    
    
    AuthModule,
    
    
    UsersModule,
    
    
    SubjectsModule,
    
    
    CoursesModule,
    
    
    EnrollmentsModule,
    
    
    ClassesModule,
    
    
    AttendancesModule,
    
    
    AttendanceSessionsModule,
    
    
    InstitutionsModule,
    
    
  
  ],
 
})
export class AppModule {}

