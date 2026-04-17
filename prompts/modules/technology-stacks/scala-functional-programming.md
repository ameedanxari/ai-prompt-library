# Scala Functional Programming Template

<!-- INSTANTIATION RULES
When the drill-down engine (or any orchestrator) uses this template:
1. Every placeholder — including {{variables}}, <TBD>, [project name], and generic
   field/function/endpoint names — MUST be replaced with project-specific values
   before output is written to prompts/outputs/current/.
2. The template filename MUST NOT appear in task output. Dissolve the template
   into concrete content; do not reference its source.
3. No strings beginning with ".ai-prompts/prompts/" may appear in the output
   (validated by scripts/validate-instantiation.sh).
4. Outputs must contain real data shapes, real endpoints, real file paths, and
   real function signatures specific to the project.
-->


## Purpose

This template provides comprehensive patterns for building functional programming applications using Scala, including pure functional programming concepts, Akka actors, Play Framework, Cats/Cats Effect, ZIO, and reactive systems. It covers enterprise-scale Scala development with advanced functional programming techniques, type-level programming, and concurrent/distributed systems.

## Context

Scala combines object-oriented and functional programming paradigms, running on the JVM with full Java interoperability. This template addresses modern Scala development including functional programming with Cats/ZIO, reactive systems with Akka, web development with Play Framework, type-level programming, and distributed systems with comprehensive testing and deployment strategies.

## Examples

### Example 1: Pure Functional Web Service with Cats Effect and Http4s
```scala
// build.sbt
ThisBuild / version := "0.1.0-SNAPSHOT"
ThisBuild / scalaVersion := "2.13.12"

lazy val root = (project in file("."))
  .settings(
    name := "scala-functional-app",
    libraryDependencies ++= Seq(
      // Cats Effect for functional programming
      "org.typelevel" %% "cats-effect" % "3.5.2",
      "org.typelevel" %% "cats-core" % "2.10.0",
      
      // Http4s for HTTP server/client
      "org.http4s" %% "http4s-ember-server" % "0.23.23",
      "org.http4s" %% "http4s-ember-client" % "0.23.23",
      "org.http4s" %% "http4s-circe" % "0.23.23",
      "org.http4s" %% "http4s-dsl" % "0.23.23",
      
      // JSON handling
      "io.circe" %% "circe-core" % "0.14.6",
      "io.circe" %% "circe-generic" % "0.14.6",
      "io.circe" %% "circe-parser" % "0.14.6",
      
      // Database access
      "org.tpolecat" %% "doobie-core" % "1.0.0-RC4",
      "org.tpolecat" %% "doobie-postgres" % "1.0.0-RC4",
      "org.tpolecat" %% "doobie-hikari" % "1.0.0-RC4",
      
      // Configuration
      "com.github.pureconfig" %% "pureconfig" % "0.17.4",
      "com.github.pureconfig" %% "pureconfig-cats-effect" % "0.17.4",
      
      // Logging
      "org.typelevel" %% "log4cats-slf4j" % "2.6.0",
      "ch.qos.logback" % "logback-classic" % "1.4.11",
      
      // Testing
      "org.scalatest" %% "scalatest" % "3.2.17" % Test,
      "org.typelevel" %% "cats-effect-testing-scalatest" % "1.5.0" % Test,
      "org.http4s" %% "http4s-testing" % "0.23.23" % Test
    )
  )

// Alternative: build.gradle for Scala projects
// plugins {
//     id 'scala'
// }
// dependencies {
//     implementation 'org.scala-lang:scala-library:2.13.12'
// }
```

```scala
// Domain Models
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto._
import java.time.Instant
import java.util.UUID

case class User(
  id: UUID,
  name: String,
  email: String,
  createdAt: Instant,
  updatedAt: Option[Instant] = None
)

object User {
  implicit val userEncoder: Encoder[User] = deriveEncoder
  implicit val userDecoder: Decoder[User] = deriveDecoder
}

case class CreateUserRequest(name: String, email: String)
object CreateUserRequest {
  implicit val decoder: Decoder[CreateUserRequest] = deriveDecoder
}

case class UpdateUserRequest(name: Option[String], email: Option[String])
object UpdateUserRequest {
  implicit val decoder: Decoder[UpdateUserRequest] = deriveDecoder
}

// Algebraic Data Types for Error Handling
sealed trait AppError extends Throwable {
  def message: String
  override def getMessage: String = message
}

object AppError {
  case class UserNotFound(id: UUID) extends AppError {
    val message = s"User with id $id not found"
  }
  
  case class EmailAlreadyExists(email: String) extends AppError {
    val message = s"User with email $email already exists"
  }
  
  case class ValidationError(field: String, reason: String) extends AppError {
    val message = s"Validation error for field $field: $reason"
  }
  
  case class DatabaseError(cause: Throwable) extends AppError {
    val message = s"Database error: ${cause.getMessage}"
  }
  
  case class NetworkError(cause: Throwable) extends AppError {
    val message = s"Network error: ${cause.getMessage}"
  }
}

// Repository Algebra (Interface)
trait UserRepository[F[_]] {
  def findAll: F[List[User]]
  def findById(id: UUID): F[Option[User]]
  def findByEmail(email: String): F[Option[User]]
  def create(user: User): F[User]
  def update(user: User): F[User]
  def delete(id: UUID): F[Boolean]
}

// Doobie Implementation
import cats.effect._
import cats.implicits._
import doobie._
import doobie.implicits._
import doobie.postgres.implicits._
import doobie.util.transactor.Transactor

class DoobieUserRepository[F[_]: MonadCancelThrow](xa: Transactor[F]) extends UserRepository[F] {
  
  def findAll: F[List[User]] =
    sql"SELECT id, name, email, created_at, updated_at FROM users"
      .query[User]
      .to[List]
      .transact(xa)
  
  def findById(id: UUID): F[Option[User]] =
    sql"SELECT id, name, email, created_at, updated_at FROM users WHERE id = $id"
      .query[User]
      .option
      .transact(xa)
  
  def findByEmail(email: String): F[Option[User]] =
    sql"SELECT id, name, email, created_at, updated_at FROM users WHERE email = $email"
      .query[User]
      .option
      .transact(xa)
  
  def create(user: User): F[User] =
    sql"""INSERT INTO users (id, name, email, created_at, updated_at) 
          VALUES (${user.id}, ${user.name}, ${user.email}, ${user.createdAt}, ${user.updatedAt})"""
      .update
      .run
      .transact(xa)
      .as(user)
  
  def update(user: User): F[User] =
    sql"""UPDATE users 
          SET name = ${user.name}, email = ${user.email}, updated_at = ${user.updatedAt}
          WHERE id = ${user.id}"""
      .update
      .run
      .transact(xa)
      .as(user)
  
  def delete(id: UUID): F[Boolean] =
    sql"DELETE FROM users WHERE id = $id"
      .update
      .run
      .transact(xa)
      .map(_ > 0)
}

// Service Layer with Functional Error Handling
import cats.effect.kernel.MonadCancelThrow
import cats.MonadError

class UserService[F[_]: MonadCancelThrow](repository: UserRepository[F]) {
  
  def getAllUsers: F[List[User]] =
    repository.findAll
  
  def getUserById(id: UUID): F[Either[AppError, User]] =
    repository.findById(id).map {
      case Some(user) => Right(user)
      case None => Left(AppError.UserNotFound(id))
    }
  
  def createUser(request: CreateUserRequest): F[Either[AppError, User]] = {
    val validation = validateCreateRequest(request)
    validation match {
      case Left(error) => MonadError[F, Throwable].pure(Left(error))
      case Right(_) =>
        repository.findByEmail(request.email).flatMap {
          case Some(_) => MonadError[F, Throwable].pure(Left(AppError.EmailAlreadyExists(request.email)))
          case None =>
            val user = User(
              id = UUID.randomUUID(),
              name = request.name,
              email = request.email,
              createdAt = Instant.now()
            )
            repository.create(user).map(Right(_))
        }
    }
  }
  
  def updateUser(id: UUID, request: UpdateUserRequest): F[Either[AppError, User]] =
    repository.findById(id).flatMap {
      case None => MonadError[F, Throwable].pure(Left(AppError.UserNotFound(id)))
      case Some(existingUser) =>
        val validation = validateUpdateRequest(request)
        validation match {
          case Left(error) => MonadError[F, Throwable].pure(Left(error))
          case Right(_) =>
            val updatedUser = existingUser.copy(
              name = request.name.getOrElse(existingUser.name),
              email = request.email.getOrElse(existingUser.email),
              updatedAt = Some(Instant.now())
            )
            repository.update(updatedUser).map(Right(_))
        }
    }
  
  def deleteUser(id: UUID): F[Either[AppError, Boolean]] =
    repository.delete(id).map { deleted =>
      if (deleted) Right(true)
      else Left(AppError.UserNotFound(id))
    }
  
  private def validateCreateRequest(request: CreateUserRequest): Either[AppError, Unit] = {
    if (request.name.trim.isEmpty) {
      Left(AppError.ValidationError("name", "Name cannot be empty"))
    } else if (!isValidEmail(request.email)) {
      Left(AppError.ValidationError("email", "Invalid email format"))
    } else {
      Right(())
    }
  }
  
  private def validateUpdateRequest(request: UpdateUserRequest): Either[AppError, Unit] = {
    request.name match {
      case Some(name) if name.trim.isEmpty =>
        Left(AppError.ValidationError("name", "Name cannot be empty"))
      case _ =>
        request.email match {
          case Some(email) if !isValidEmail(email) =>
            Left(AppError.ValidationError("email", "Invalid email format"))
          case _ => Right(())
        }
    }
  }
  
  private def isValidEmail(email: String): Boolean = {
    val emailRegex = """^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$""".r
    emailRegex.matches(email)
  }
}

// HTTP Routes with Http4s
import org.http4s._
import org.http4s.dsl.Http4sDsl
import org.http4s.circe.CirceEntityCodec._
import cats.effect.kernel.Async

class UserRoutes[F[_]: Async](userService: UserService[F]) extends Http4sDsl[F] {
  
  val routes: HttpRoutes[F] = HttpRoutes.of[F] {
    case GET -> Root / "users" =>
      userService.getAllUsers.flatMap(users => Ok(users))
    
    case GET -> Root / "users" / UUIDVar(id) =>
      userService.getUserById(id).flatMap {
        case Right(user) => Ok(user)
        case Left(AppError.UserNotFound(_)) => NotFound(s"User with id $id not found")
        case Left(error) => InternalServerError(error.message)
      }
    
    case req @ POST -> Root / "users" =>
      req.as[CreateUserRequest].flatMap { createRequest =>
        userService.createUser(createRequest).flatMap {
          case Right(user) => Created(user)
          case Left(AppError.EmailAlreadyExists(_)) => Conflict("Email already exists")
          case Left(AppError.ValidationError(_, reason)) => BadRequest(reason)
          case Left(error) => InternalServerError(error.message)
        }
      }
    
    case req @ PUT -> Root / "users" / UUIDVar(id) =>
      req.as[UpdateUserRequest].flatMap { updateRequest =>
        userService.updateUser(id, updateRequest).flatMap {
          case Right(user) => Ok(user)
          case Left(AppError.UserNotFound(_)) => NotFound(s"User with id $id not found")
          case Left(AppError.ValidationError(_, reason)) => BadRequest(reason)
          case Left(error) => InternalServerError(error.message)
        }
      }
    
    case DELETE -> Root / "users" / UUIDVar(id) =>
      userService.deleteUser(id).flatMap {
        case Right(_) => NoContent()
        case Left(AppError.UserNotFound(_)) => NotFound(s"User with id $id not found")
        case Left(error) => InternalServerError(error.message)
      }
  }
}

// Application Configuration
import pureconfig._
import pureconfig.generic.auto._

case class DatabaseConfig(
  driver: String,
  url: String,
  user: String,
  password: String,
  maxConnections: Int
)

case class ServerConfig(
  host: String,
  port: Int
)

case class AppConfig(
  server: ServerConfig,
  database: DatabaseConfig
)

// Main Application
import org.http4s.ember.server.EmberServerBuilder
import org.http4s.server.middleware.{CORS, Logger}
import com.comcast.ip4s._
import org.typelevel.log4cats.Logger as Log4CatsLogger
import org.typelevel.log4cats.slf4j.Slf4jLogger

object Main extends IOApp {
  
  implicit val logger: Log4CatsLogger[IO] = Slf4jLogger.getLogger[IO]
  
  def run(args: List[String]): IO[ExitCode] = {
    for {
      config <- loadConfig[IO]
      xa <- createTransactor[IO](config.database)
      _ <- runMigrations[IO](xa)
      exitCode <- createServer[IO](config, xa).use(_ => IO.never)
    } yield exitCode
  }
  
  private def loadConfig[F[_]: Sync]: F[AppConfig] =
    Sync[F].delay(ConfigSource.default.loadOrThrow[AppConfig])
  
  private def createTransactor[F[_]: Async](config: DatabaseConfig): F[Transactor[F]] =
    for {
      ce <- ExecutionContexts.fixedThreadPool[F](config.maxConnections)
      xa <- HikariTransactor.newHikariTransactor[F](
        config.driver,
        config.url,
        config.user,
        config.password,
        ce
      )
    } yield xa
  
  private def runMigrations[F[_]: MonadCancelThrow](xa: Transactor[F]): F[Unit] = {
    val createTable = sql"""
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP
      )
    """.update.run
    
    createTable.transact(xa).void
  }
  
  private def createServer[F[_]: Async](config: AppConfig, xa: Transactor[F]): Resource[F, org.http4s.server.Server] = {
    val userRepository = new DoobieUserRepository[F](xa)
    val userService = new UserService[F](userRepository)
    val userRoutes = new UserRoutes[F](userService)
    
    val httpApp = CORS.policy.withAllowOriginAll(
      Logger.httpApp(logHeaders = true, logBody = true)(userRoutes.routes.orNotFound)
    )
    
    EmberServerBuilder.default[F]
      .withHost(Host.fromString(config.server.host).get)
      .withPort(Port.fromInt(config.server.port).get)
      .withHttpApp(httpApp)
      .build
  }
}
```

### Example 2: Akka Actors for Concurrent Processing
```scala
// build.sbt additions for Akka
libraryDependencies ++= Seq(
  "com.typesafe.akka" %% "akka-actor-typed" % "2.8.5",
  "com.typesafe.akka" %% "akka-stream" % "2.8.5",
  "com.typesafe.akka" %% "akka-http" % "10.5.3",
  "com.typesafe.akka" %% "akka-http-spray-json" % "10.5.3",
  "com.typesafe.akka" %% "akka-cluster-typed" % "2.8.5",
  "com.typesafe.akka" %% "akka-persistence-typed" % "2.8.5",
  "com.typesafe.akka" %% "akka-serialization-jackson" % "2.8.5"
)

// Actor System with Typed Actors
import akka.actor.typed.{ActorRef, ActorSystem, Behavior}
import akka.actor.typed.scaladsl.{AbstractBehavior, ActorContext, Behaviors}
import akka.util.Timeout
import scala.concurrent.duration._
import scala.concurrent.Future

// User Actor Messages
object UserActor {
  sealed trait Command
  
  case class CreateUser(user: User, replyTo: ActorRef[UserResponse]) extends Command
  case class GetUser(id: UUID, replyTo: ActorRef[UserResponse]) extends Command
  case class UpdateUser(user: User, replyTo: ActorRef[UserResponse]) extends Command
  case class DeleteUser(id: UUID, replyTo: ActorRef[UserResponse]) extends Command
  case class ListUsers(replyTo: ActorRef[UsersResponse]) extends Command
  
  sealed trait Response
  case class UserResponse(result: Either[AppError, User]) extends Response
  case class UsersResponse(users: List[User]) extends Response
  case class DeleteResponse(success: Boolean) extends Response
  
  def apply(repository: UserRepository[Future]): Behavior[Command] =
    Behaviors.setup(context => new UserActor(context, repository))
}

class UserActor(
  context: ActorContext[UserActor.Command],
  repository: UserRepository[Future]
) extends AbstractBehavior[UserActor.Command](context) {
  
  import UserActor._
  import context.executionContext
  
  override def onMessage(msg: Command): Behavior[Command] = {
    msg match {
      case CreateUser(user, replyTo) =>
        repository.create(user).onComplete {
          case scala.util.Success(createdUser) =>
            replyTo ! UserResponse(Right(createdUser))
          case scala.util.Failure(exception) =>
            replyTo ! UserResponse(Left(AppError.DatabaseError(exception)))
        }
        this
        
      case GetUser(id, replyTo) =>
        repository.findById(id).onComplete {
          case scala.util.Success(Some(user)) =>
            replyTo ! UserResponse(Right(user))
          case scala.util.Success(None) =>
            replyTo ! UserResponse(Left(AppError.UserNotFound(id)))
          case scala.util.Failure(exception) =>
            replyTo ! UserResponse(Left(AppError.DatabaseError(exception)))
        }
        this
        
      case UpdateUser(user, replyTo) =>
        repository.update(user).onComplete {
          case scala.util.Success(updatedUser) =>
            replyTo ! UserResponse(Right(updatedUser))
          case scala.util.Failure(exception) =>
            replyTo ! UserResponse(Left(AppError.DatabaseError(exception)))
        }
        this
        
      case DeleteUser(id, replyTo) =>
        repository.delete(id).onComplete {
          case scala.util.Success(deleted) =>
            replyTo ! DeleteResponse(deleted)
          case scala.util.Failure(exception) =>
            replyTo ! UserResponse(Left(AppError.DatabaseError(exception)))
        }
        this
        
      case ListUsers(replyTo) =>
        repository.findAll.onComplete {
          case scala.util.Success(users) =>
            replyTo ! UsersResponse(users)
          case scala.util.Failure(_) =>
            replyTo ! UsersResponse(List.empty)
        }
        this
    }
  }
}

// Supervisor Actor
object UserSupervisor {
  sealed trait Command
  case class GetUserActor(replyTo: ActorRef[ActorRef[UserActor.Command]]) extends Command
  
  def apply(repository: UserRepository[Future]): Behavior[Command] =
    Behaviors.setup { context =>
      val userActor = context.spawn(UserActor(repository), "user-actor")
      
      Behaviors.receiveMessage {
        case GetUserActor(replyTo) =>
          replyTo ! userActor
          Behaviors.same
      }
    }
}

// Akka HTTP Routes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.model.StatusCodes
import spray.json.DefaultJsonProtocol._
import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport._

class AkkaUserRoutes(userSupervisor: ActorRef[UserSupervisor.Command])(implicit system: ActorSystem[_]) {
  
  implicit val timeout: Timeout = 3.seconds
  import akka.actor.typed.scaladsl.AskPattern._
  
  // JSON formatters
  implicit val userFormat = jsonFormat5(User.apply)
  implicit val createUserRequestFormat = jsonFormat2(CreateUserRequest.apply)
  implicit val updateUserRequestFormat = jsonFormat2(UpdateUserRequest.apply)
  
  val routes: Route =
    pathPrefix("users") {
      concat(
        pathEnd {
          concat(
            get {
              val usersFuture = for {
                userActor <- userSupervisor.ask(UserSupervisor.GetUserActor)
                response <- userActor.ask(UserActor.ListUsers)
              } yield response
              
              onSuccess(usersFuture) {
                case UserActor.UsersResponse(users) => complete(users)
              }
            },
            post {
              entity(as[CreateUserRequest]) { request =>
                val userFuture = for {
                  userActor <- userSupervisor.ask(UserSupervisor.GetUserActor)
                  user = User(UUID.randomUUID(), request.name, request.email, Instant.now())
                  response <- userActor.ask(UserActor.CreateUser(user, _))
                } yield response
                
                onSuccess(userFuture) {
                  case UserActor.UserResponse(Right(user)) => complete(StatusCodes.Created, user)
                  case UserActor.UserResponse(Left(error)) => complete(StatusCodes.BadRequest, error.message)
                }
              }
            }
          )
        },
        path(JavaUUID) { id =>
          concat(
            get {
              val userFuture = for {
                userActor <- userSupervisor.ask(UserSupervisor.GetUserActor)
                response <- userActor.ask(UserActor.GetUser(id, _))
              } yield response
              
              onSuccess(userFuture) {
                case UserActor.UserResponse(Right(user)) => complete(user)
                case UserActor.UserResponse(Left(_)) => complete(StatusCodes.NotFound)
              }
            },
            put {
              entity(as[UpdateUserRequest]) { request =>
                val userFuture = for {
                  userActor <- userSupervisor.ask(UserSupervisor.GetUserActor)
                  // First get the existing user, then update
                  existingResponse <- userActor.ask(UserActor.GetUser(id, _))
                  updateResponse <- existingResponse match {
                    case UserActor.UserResponse(Right(existingUser)) =>
                      val updatedUser = existingUser.copy(
                        name = request.name.getOrElse(existingUser.name),
                        email = request.email.getOrElse(existingUser.email),
                        updatedAt = Some(Instant.now())
                      )
                      userActor.ask(UserActor.UpdateUser(updatedUser, _))
                    case error => Future.successful(error)
                  }
                } yield updateResponse
                
                onSuccess(userFuture) {
                  case UserActor.UserResponse(Right(user)) => complete(user)
                  case UserActor.UserResponse(Left(AppError.UserNotFound(_))) => complete(StatusCodes.NotFound)
                  case UserActor.UserResponse(Left(error)) => complete(StatusCodes.BadRequest, error.message)
                }
              }
            },
            delete {
              val deleteFuture = for {
                userActor <- userSupervisor.ask(UserSupervisor.GetUserActor)
                response <- userActor.ask(UserActor.DeleteUser(id, _))
              } yield response
              
              onSuccess(deleteFuture) {
                case UserActor.DeleteResponse(true) => complete(StatusCodes.NoContent)
                case UserActor.DeleteResponse(false) => complete(StatusCodes.NotFound)
              }
            }
          )
        }
      )
    }
}
```

### Example 3: ZIO for Functional Effects
```scala
// build.sbt additions for ZIO
libraryDependencies ++= Seq(
  "dev.zio" %% "zio" % "2.0.19",
  "dev.zio" %% "zio-http" % "3.0.0-RC4",
  "dev.zio" %% "zio-json" % "0.6.2",
  "dev.zio" %% "zio-config" % "4.0.0-RC16",
  "dev.zio" %% "zio-config-typesafe" % "4.0.0-RC16",
  "dev.zio" %% "zio-logging" % "2.1.14",
  "dev.zio" %% "zio-test" % "2.0.19" % Test,
  "dev.zio" %% "zio-test-sbt" % "2.0.19" % Test
)

// ZIO-based User Service
import zio._
import zio.json._
import zio.http._

// Domain models with ZIO JSON
case class ZIOUser(
  id: String,
  name: String,
  email: String,
  createdAt: Long,
  updatedAt: Option[Long] = None
)

object ZIOUser {
  implicit val encoder: JsonEncoder[ZIOUser] = DeriveJsonEncoder.gen[ZIOUser]
  implicit val decoder: JsonDecoder[ZIOUser] = DeriveJsonDecoder.gen[ZIOUser]
}

case class CreateZIOUserRequest(name: String, email: String)
object CreateZIOUserRequest {
  implicit val decoder: JsonDecoder[CreateZIOUserRequest] = DeriveJsonDecoder.gen[CreateZIOUserRequest]
}

// ZIO Service Definition
trait ZIOUserService {
  def getAllUsers: Task[List[ZIOUser]]
  def getUserById(id: String): Task[Option[ZIOUser]]
  def createUser(request: CreateZIOUserRequest): Task[ZIOUser]
  def updateUser(id: String, name: Option[String], email: Option[String]): Task[Option[ZIOUser]]
  def deleteUser(id: String): Task[Boolean]
}

// ZIO Service Implementation
case class ZIOUserServiceImpl(ref: Ref[Map[String, ZIOUser]]) extends ZIOUserService {
  
  def getAllUsers: Task[List[ZIOUser]] =
    ref.get.map(_.values.toList)
  
  def getUserById(id: String): Task[Option[ZIOUser]] =
    ref.get.map(_.get(id))
  
  def createUser(request: CreateZIOUserRequest): Task[ZIOUser] =
    for {
      id <- Random.nextUUID.map(_.toString)
      now <- Clock.currentTime(java.util.concurrent.TimeUnit.MILLISECONDS)
      user = ZIOUser(id, request.name, request.email, now)
      _ <- ref.update(_ + (id -> user))
    } yield user
  
  def updateUser(id: String, name: Option[String], email: Option[String]): Task[Option[ZIOUser]] =
    for {
      now <- Clock.currentTime(java.util.concurrent.TimeUnit.MILLISECONDS)
      result <- ref.modify { users =>
        users.get(id) match {
          case Some(existingUser) =>
            val updatedUser = existingUser.copy(
              name = name.getOrElse(existingUser.name),
              email = email.getOrElse(existingUser.email),
              updatedAt = Some(now)
            )
            (Some(updatedUser), users + (id -> updatedUser))
          case None =>
            (None, users)
        }
      }
    } yield result
  
  def deleteUser(id: String): Task[Boolean] =
    ref.modify { users =>
      if (users.contains(id)) {
        (true, users - id)
      } else {
        (false, users)
      }
    }
}

// ZIO HTTP Routes
object ZIOUserRoutes {
  
  def routes: Http[ZIOUserService, Response, Request, Response] =
    Http.collectZIO[Request] {
      case Method.GET -> Root / "users" =>
        ZIO.serviceWithZIO[ZIOUserService](_.getAllUsers)
          .map(users => Response.json(users.toJson))
      
      case Method.GET -> Root / "users" / id =>
        ZIO.serviceWithZIO[ZIOUserService](_.getUserById(id))
          .map {
            case Some(user) => Response.json(user.toJson)
            case None => Response.status(Status.NotFound)
          }
      
      case req @ Method.POST -> Root / "users" =>
        for {
          body <- req.body.asString
          createRequest <- ZIO.fromEither(body.fromJson[CreateZIOUserRequest])
            .mapError(_ => Response.status(Status.BadRequest))
          user <- ZIO.serviceWithZIO[ZIOUserService](_.createUser(createRequest))
        } yield Response.json(user.toJson).status(Status.Created)
      
      case req @ Method.PUT -> Root / "users" / id =>
        for {
          body <- req.body.asString
          updateData <- ZIO.fromEither(body.fromJson[Map[String, String]])
            .mapError(_ => Response.status(Status.BadRequest))
          name = updateData.get("name")
          email = updateData.get("email")
          result <- ZIO.serviceWithZIO[ZIOUserService](_.updateUser(id, name, email))
        } yield result match {
          case Some(user) => Response.json(user.toJson)
          case None => Response.status(Status.NotFound)
        }
      
      case Method.DELETE -> Root / "users" / id =>
        ZIO.serviceWithZIO[ZIOUserService](_.deleteUser(id))
          .map { deleted =>
            if (deleted) Response.status(Status.NoContent)
            else Response.status(Status.NotFound)
          }
    }
}

// ZIO Application
object ZIOUserApp extends ZIOAppDefault {
  
  def run: ZIO[Any, Throwable, Unit] =
    for {
      ref <- Ref.make(Map.empty[String, ZIOUser])
      userService = ZIOUserServiceImpl(ref)
      _ <- Server.serve(ZIOUserRoutes.routes)
        .provide(
          Server.default,
          ZLayer.succeed(userService)
        )
    } yield ()
}
```

## Instructions

### 1. Set Up Scala Development Environment

```bash
# Install Scala using SDKMAN
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"
sdk install scala 2.13.12
sdk install sbt 1.9.7

# Or using Homebrew on macOS
brew install scala sbt

# Install Metals for VS Code or IntelliJ IDEA
# VS Code: Install Scala (Metals) extension
# IntelliJ IDEA: Install Scala plugin
```

### 2. Create New Scala Project

```bash
# Create new SBT project
sbt new scala/scala-seed.g8
cd my-scala-project

# Or create manually
mkdir my-scala-project
cd my-scala-project

# Create build.sbt
cat > build.sbt << 'EOF'
ThisBuild / version := "0.1.0-SNAPSHOT"
ThisBuild / scalaVersion := "2.13.12"

lazy val root = (project in file("."))
  .settings(
    name := "my-scala-project",
    libraryDependencies ++= Seq(
      "org.scalatest" %% "scalatest" % "3.2.17" % Test
    )
  )
EOF

# Create project structure
mkdir -p src/main/scala
mkdir -p src/test/scala
mkdir -p project
```

### 3. Implement Functional Programming Patterns

```scala
// Higher-Order Functions and Function Composition
object FunctionalPatterns {
  
  // Function composition
  def compose[A, B, C](f: B => C, g: A => B): A => C = a => f(g(a))
  
  // Currying
  def add(x: Int)(y: Int): Int = x + y
  val addFive = add(5) _
  
  // Partial application
  def multiply(x: Int, y: Int, z: Int): Int = x * y * z
  val multiplyByTwo = multiply(2, _, _)
  
  // Monads and for-comprehensions
  def processUser(id: String): Option[String] = {
    for {
      user <- findUser(id)
      profile <- findProfile(user.profileId)
      settings <- findSettings(profile.settingsId)
    } yield s"User: ${user.name}, Theme: ${settings.theme}"
  }
  
  // For-yield with collections
  def generatePairs(n: Int): List[(Int, Int)] = {
    for {
      i <- (1 to n).toList
      j <- (1 to n).toList
      if i < j
    } yield (i, j)
  }
  
  // Simple for-yield on one line
  val doubled = for (x <- List(1, 2, 3)) yield x * 2
  
  // Tail recursion
  @annotation.tailrec
  def factorial(n: Int, acc: Int = 1): Int = {
    if (n <= 1) acc
    else factorial(n - 1, n * acc)
  }
  
  // Immutable data structures
  case class ImmutableList[A](head: A, tail: Option[ImmutableList[A]]) {
    def prepend(elem: A): ImmutableList[A] = ImmutableList(elem, Some(this))
    
    def map[B](f: A => B): ImmutableList[B] = {
      ImmutableList(f(head), tail.map(_.map(f)))
    }
    
    def foldLeft[B](acc: B)(f: (B, A) => B): B = {
      tail match {
        case Some(t) => t.foldLeft(f(acc, head))(f)
        case None => f(acc, head)
      }
    }
  }
}
```

### 4. Implement Type-Level Programming

```scala
// Advanced type system features
object TypeLevelProgramming {
  
  // Phantom types
  sealed trait State
  sealed trait Open extends State
  sealed trait Closed extends State
  
  case class Connection[S <: State](url: String)
  
  def open(url: String): Connection[Open] = Connection[Open](url)
  def close[S <: State](conn: Connection[S]): Connection[Closed] = Connection[Closed](conn.url)
  def query[T](conn: Connection[Open], sql: String): List[T] = ??? // Only works with open connections
  
  // Type classes
  trait Show[A] {
    def show(a: A): String
  }
  
  object Show {
    def apply[A](implicit show: Show[A]): Show[A] = show
    
    implicit val stringShow: Show[String] = (a: String) => a
    implicit val intShow: Show[Int] = (a: Int) => a.toString
    implicit def listShow[A: Show]: Show[List[A]] = (list: List[A]) =>
      list.map(Show[A].show).mkString("[", ", ", "]")
  }
  
  def print[A: Show](a: A): String = Show[A].show(a)
  
  // Higher-kinded types
  trait Functor[F[_]] {
    def map[A, B](fa: F[A])(f: A => B): F[B]
  }
  
  implicit val optionFunctor: Functor[Option] = new Functor[Option] {
    def map[A, B](fa: Option[A])(f: A => B): Option[B] = fa.map(f)
  }
  
  implicit val listFunctor: Functor[List] = new Functor[List] {
    def map[A, B](fa: List[A])(f: A => B): List[B] = fa.map(f)
  }
  
  // Dependent types
  trait DepList {
    type Elem
    def head: Elem
    def tail: DepList
  }
  
  case class IntList(head: Int, tail: DepList) extends DepList {
    type Elem = Int
  }
  
  case class StringList(head: String, tail: DepList) extends DepList {
    type Elem = String
  }
}
```

## Implementation Patterns

### Cats Effect for Pure Functional Programming

```scala
import cats.effect._
import cats.implicits._

// Resource management with Resource
def createDatabaseConnection[F[_]: Async]: Resource[F, Connection] =
  Resource.make(
    Async[F].delay(DriverManager.getConnection("jdbc:postgresql://localhost/mydb"))
  )(conn => Async[F].delay(conn.close()))

// Fiber-based concurrency
def processInParallel[F[_]: Async](items: List[String]): F[List[String]] = {
  items.parTraverse { item =>
    Async[F].start(processItem(item)).flatMap(_.joinWithNever)
  }
}

// Error handling with MonadError
def safeOperation[F[_]: MonadError[*[_], Throwable]](input: String): F[String] = {
  if (input.nonEmpty) {
    MonadError[F, Throwable].pure(input.toUpperCase)
  } else {
    MonadError[F, Throwable].raiseError(new IllegalArgumentException("Input cannot be empty"))
  }
}

// Streaming with FS2
import fs2.Stream

def processStream[F[_]: Async]: Stream[F, String] = {
  Stream.range(1, 100)
    .map(_.toString)
    .through(fs2.text.utf8.encode)
    .through(fs2.io.file.Files[F].writeAll(java.nio.file.Paths.get("output.txt")))
    .drain
}
```

### Akka Persistence for Event Sourcing

```scala
import akka.persistence.typed.PersistenceId
import akka.persistence.typed.scaladsl.{Effect, EventSourcedBehavior}

// Event sourcing with Akka Persistence
object UserPersistentActor {
  
  sealed trait Command
  case class CreateUser(user: User, replyTo: ActorRef[Response]) extends Command
  case class UpdateUser(id: UUID, name: String, replyTo: ActorRef[Response]) extends Command
  
  sealed trait Event
  case class UserCreated(user: User) extends Event
  case class UserUpdated(id: UUID, name: String) extends Event
  
  case class State(users: Map[UUID, User] = Map.empty)
  
  sealed trait Response
  case class UserResponse(user: User) extends Response
  case class ErrorResponse(message: String) extends Response
  
  def apply(persistenceId: PersistenceId): Behavior[Command] =
    EventSourcedBehavior[Command, Event, State](
      persistenceId = persistenceId,
      emptyState = State(),
      commandHandler = commandHandler,
      eventHandler = eventHandler
    )
  
  private def commandHandler: (State, Command) => Effect[Event, State] = {
    (state, command) =>
      command match {
        case CreateUser(user, replyTo) =>
          Effect.persist(UserCreated(user))
            .thenReply(replyTo)(_ => UserResponse(user))
        
        case UpdateUser(id, name, replyTo) =>
          state.users.get(id) match {
            case Some(_) =>
              Effect.persist(UserUpdated(id, name))
                .thenReply(replyTo)(newState => UserResponse(newState.users(id)))
            case None =>
              Effect.reply(replyTo)(ErrorResponse(s"User $id not found"))
          }
      }
  }
  
  private def eventHandler: (State, Event) => State = {
    (state, event) =>
      event match {
        case UserCreated(user) =>
          state.copy(users = state.users + (user.id -> user))
        
        case UserUpdated(id, name) =>
          state.users.get(id) match {
            case Some(user) =>
              val updatedUser = user.copy(name = name, updatedAt = Some(Instant.now()))
              state.copy(users = state.users + (id -> updatedUser))
            case None => state
          }
      }
  }
}
```

## Expected Output

### Functional Programming Benefits
- Immutable data structures and pure functions
- Composable and reusable code components
- Type safety with advanced type system features
- Concurrent and parallel processing capabilities
- Robust error handling with algebraic data types

### Performance Characteristics
- JVM optimization and performance
- Efficient memory usage with immutable structures
- Parallel processing with Akka actors
- Streaming data processing with Akka Streams/FS2
- Lazy evaluation and tail call optimization

### Scalability Features
- Actor-based concurrency model
- Distributed systems with Akka Cluster
- Event sourcing and CQRS patterns
- Reactive streams for backpressure handling
- Microservices architecture support

## Integration Points

Scala integrates with the entire JVM ecosystem, providing access to Java libraries and frameworks while adding functional programming capabilities. Database integration through Slick and Doobie offers type-safe query composition, while Akka enables distributed systems and reactive streams. The language seamlessly integrates with message queues like Kafka, caching systems like Redis, and cloud services through various client libraries. Scala's interoperability with Java ensures compatibility with enterprise systems and legacy codebases.

```scala
// Example integration patterns
import slick.jdbc.PostgresProfile.api._
import akka.actor.ActorSystem
import akka.kafka.scaladsl.Consumer

// Slick database connection
val db = Database.forConfig("mydb")
val users = TableQuery[UserTable]

// Akka actor system
implicit val system = ActorSystem("MySystem")

// Kafka consumer
val consumerSettings = ConsumerSettings(system, new StringDeserializer, new StringDeserializer)
```

### Database Integration
```scala
// Slick for functional database access
import slick.jdbc.PostgresProfile.api._

class UserTable(tag: Tag) extends Table[User](tag, "users") {
  def id = column[UUID]("id", O.PrimaryKey)
  def name = column[String]("name")
  def email = column[String]("email")
  def createdAt = column[Instant]("created_at")
  def updatedAt = column[Option[Instant]]("updated_at")
  
  def * = (id, name, email, createdAt, updatedAt).mapTo[User]
}

val users = TableQuery[UserTable]

// Functional database operations
def findUserById(id: UUID): DBIO[Option[User]] =
  users.filter(_.id === id).result.headOption

def createUser(user: User): DBIO[User] =
  (users += user).map(_ => user)
```

### Message Queue Integration
```scala
// Akka Streams with Kafka
import akka.kafka.{ConsumerSettings, ProducerSettings}
import akka.kafka.scaladsl.{Consumer, Producer}
import org.apache.kafka.clients.consumer.ConsumerConfig
import org.apache.kafka.clients.producer.ProducerRecord

def kafkaConsumer[F[_]: Async]: Stream[F, String] = {
  val consumerSettings = ConsumerSettings(system, new StringDeserializer, new StringDeserializer)
    .withBootstrapServers("localhost:9092")
    .withGroupId("user-service")
    .withProperty(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest")
  
  Consumer
    .plainSource(consumerSettings, Subscriptions.topics("user-events"))
    .map(_.value())
}

def kafkaProducer(topic: String, message: String): Future[Done] = {
  val producerSettings = ProducerSettings(system, new StringSerializer, new StringSerializer)
    .withBootstrapServers("localhost:9092")
  
  Source.single(new ProducerRecord[String, String](topic, message))
    .runWith(Producer.plainSink(producerSettings))
}
```

## Security Considerations

Scala applications benefit from JVM security features including bytecode verification, security managers, and cryptographic libraries. The type system enables compile-time verification of security properties, while libraries like refined provide type-level validation. Security best practices include JWT authentication with proper token validation, input sanitization using validated types, secure password hashing with BCrypt, and protection against common vulnerabilities like SQL injection through parameterized queries and type-safe database access.

### Authentication and Authorization
```scala
// JWT authentication with Play Framework
import play.api.libs.json._
import pdi.jwt.{JwtJson, JwtAlgorithm}

case class AuthenticatedUser(id: UUID, email: String, roles: Set[String])

object AuthService {
  private val secretKey = "your-secret-key"
  private val algorithm = JwtAlgorithm.HS256
  
  def generateToken(user: AuthenticatedUser): String = {
    val claims = Json.obj(
      "userId" -> user.id.toString,
      "email" -> user.email,
      "roles" -> user.roles
    )
    JwtJson.encode(claims, secretKey, algorithm)
  }
  
  def validateToken(token: String): Option[AuthenticatedUser] = {
    JwtJson.decode(token, secretKey, Seq(algorithm)).toOption.flatMap { claims =>
      for {
        userId <- (claims \ "userId").asOpt[String].map(UUID.fromString)
        email <- (claims \ "email").asOpt[String]
        roles <- (claims \ "roles").asOpt[Set[String]]
      } yield AuthenticatedUser(userId, email, roles)
    }
  }
}

// Authorization with type-safe permissions
sealed trait Permission
case object ReadUsers extends Permission
case object WriteUsers extends Permission
case object AdminAccess extends Permission

case class AuthContext(user: AuthenticatedUser, permissions: Set[Permission])

def requirePermission[F[_]: MonadError[*[_], Throwable]](
  permission: Permission
)(implicit ctx: AuthContext): F[Unit] = {
  if (ctx.permissions.contains(permission)) {
    MonadError[F, Throwable].unit
  } else {
    MonadError[F, Throwable].raiseError(new SecurityException("Insufficient permissions"))
  }
}
```

### Input Validation
```scala
// Refined types for validation
import eu.timepit.refined._
import eu.timepit.refined.api.Refined
import eu.timepit.refined.string._
import eu.timepit.refined.collection._

type NonEmptyString = String Refined NonEmpty
type EmailString = String Refined MatchesRegex["^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"]

case class ValidatedUser(
  name: NonEmptyString,
  email: EmailString
)

def validateUser(name: String, email: String): Either[String, ValidatedUser] = {
  for {
    validName <- refineV[NonEmpty](name)
    validEmail <- refineV[MatchesRegex["^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"]](email)
  } yield ValidatedUser(validName, validEmail)
}
```

## Performance Features

Scala achieves high performance through JVM optimizations, tail call optimization for recursive functions, and lazy evaluation for deferred computation. The language supports parallel collections for multi-core processing, Akka actors for concurrent systems, and efficient immutable data structures. Performance optimization techniques include memoization for expensive computations, stream processing for large datasets, and compile-time optimizations through macros and inline functions. The combination of functional programming and JVM performance delivers scalable, high-throughput applications.

### Lazy Evaluation and Memoization
```scala
// Lazy evaluation with Stream
def fibonacci: LazyList[BigInt] = {
  def fib(a: BigInt, b: BigInt): LazyList[BigInt] = a #:: fib(b, a + b)
  fib(0, 1)
}

// Memoization
import scala.collection.mutable

def memoize[A, B](f: A => B): A => B = {
  val cache = mutable.Map.empty[A, B]
  (a: A) => cache.getOrElseUpdate(a, f(a))
}

val expensiveFunction = memoize { (n: Int) =>
  Thread.sleep(1000) // Simulate expensive computation
  n * n
}
```

### Parallel Collections
```scala
// Parallel processing with parallel collections
val largeList = (1 to 1000000).toList

// Sequential processing
val sequentialResult = largeList.map(_ * 2).filter(_ > 1000).sum

// Parallel processing
val parallelResult = largeList.par.map(_ * 2).filter(_ > 1000).sum

// Custom parallel processing with Futures
import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

def processInParallel[A, B](items: List[A])(f: A => B): Future[List[B]] = {
  val futures = items.map(item => Future(f(item)))
  Future.sequence(futures)
}
```
