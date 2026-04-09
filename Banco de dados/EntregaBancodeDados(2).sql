-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: projeto_integrador
-- ------------------------------------------------------
-- Server version	8.0.35

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alternativa`
--

DROP TABLE IF EXISTS `alternativa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alternativa` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `correta` bit(1) DEFAULT NULL,
  `texto` varchar(255) DEFAULT NULL,
  `questao_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK1r2gwu4bd0jnmah9m5401qex5` (`questao_id`),
  CONSTRAINT `FK1r2gwu4bd0jnmah9m5401qex5` FOREIGN KEY (`questao_id`) REFERENCES `questao` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alternativa`
--

LOCK TABLES `alternativa` WRITE;
/*!40000 ALTER TABLE `alternativa` DISABLE KEYS */;
INSERT INTO `alternativa` VALUES (6,_binary '\0','3',3),(7,_binary '','4',3),(8,_binary '\0','5',3),(9,_binary '\0','6',3);
/*!40000 ALTER TABLE `alternativa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compromisso`
--

DROP TABLE IF EXISTS `compromisso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compromisso` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `data` date DEFAULT NULL,
  `materia_id` bigint DEFAULT NULL,
  `obs` varchar(255) DEFAULT NULL,
  `tipo_compromisso` varchar(255) DEFAULT NULL,
  `titulo` varchar(255) DEFAULT NULL,
  `usuario_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKr4bxh9ei5ps6m731b2xwhu16m` (`materia_id`),
  KEY `FKnvk71pbdquyyi5cs6u84jg3qt` (`usuario_id`),
  CONSTRAINT `FKnvk71pbdquyyi5cs6u84jg3qt` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`),
  CONSTRAINT `FKr4bxh9ei5ps6m731b2xwhu16m` FOREIGN KEY (`materia_id`) REFERENCES `materia` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compromisso`
--

LOCK TABLES `compromisso` WRITE;
/*!40000 ALTER TABLE `compromisso` DISABLE KEYS */;
/*!40000 ALTER TABLE `compromisso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `flashcard`
--

DROP TABLE IF EXISTS `flashcard`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `flashcard` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `pergunta` varchar(255) DEFAULT NULL,
  `reposta` varchar(255) DEFAULT NULL,
  `unidade_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK7hgclxkw9mh8e4niohq4k17bl` (`unidade_id`),
  CONSTRAINT `FK7hgclxkw9mh8e4niohq4k17bl` FOREIGN KEY (`unidade_id`) REFERENCES `unidade` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `flashcard`
--

LOCK TABLES `flashcard` WRITE;
/*!40000 ALTER TABLE `flashcard` DISABLE KEYS */;
/*!40000 ALTER TABLE `flashcard` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `materia`
--

DROP TABLE IF EXISTS `materia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materia` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `materia`
--

LOCK TABLES `materia` WRITE;
/*!40000 ALTER TABLE `materia` DISABLE KEYS */;
INSERT INTO `materia` VALUES (4,'Matemática'),(5,'Português'),(6,'Fisica'),(7,'Quimica');
/*!40000 ALTER TABLE `materia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `progresso_unidade`
--

DROP TABLE IF EXISTS `progresso_unidade`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `progresso_unidade` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `percentual` float DEFAULT NULL,
  `ultima_atividade` varchar(255) DEFAULT NULL,
  `unidade_id` bigint DEFAULT NULL,
  `usuario_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK1xyp5wsqeda1g9wm7nuu6taje` (`unidade_id`),
  KEY `FK2xpk3m7kpgh4463mnp6w1v7ku` (`usuario_id`),
  CONSTRAINT `FK1xyp5wsqeda1g9wm7nuu6taje` FOREIGN KEY (`unidade_id`) REFERENCES `unidade` (`id`),
  CONSTRAINT `FK2xpk3m7kpgh4463mnp6w1v7ku` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `progresso_unidade`
--

LOCK TABLES `progresso_unidade` WRITE;
/*!40000 ALTER TABLE `progresso_unidade` DISABLE KEYS */;
/*!40000 ALTER TABLE `progresso_unidade` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questao`
--

DROP TABLE IF EXISTS `questao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questao` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `dificuldade` varchar(255) DEFAULT NULL,
  `pergunta` varchar(255) DEFAULT NULL,
  `unidade_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKkmy7cjbodchc62bydad2gcp6o` (`unidade_id`),
  CONSTRAINT `FKkmy7cjbodchc62bydad2gcp6o` FOREIGN KEY (`unidade_id`) REFERENCES `unidade` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questao`
--

LOCK TABLES `questao` WRITE;
/*!40000 ALTER TABLE `questao` DISABLE KEYS */;
INSERT INTO `questao` VALUES (3,'facil','Quanto é 2+2',2),(4,'facil','Quanto é a fração de 2+2',3),(5,'facil','Quanto é a força de 2+2',4),(6,'facil','Quanto é a oxidação de 2+2',5);
/*!40000 ALTER TABLE `questao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `respota_usuario`
--

DROP TABLE IF EXISTS `respota_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `respota_usuario` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `acertou` bit(1) DEFAULT NULL,
  `atributo_questao` varchar(255) DEFAULT NULL,
  `data_resposta` datetime(6) DEFAULT NULL,
  `usuario_id` bigint DEFAULT NULL,
  `questao_id` bigint DEFAULT NULL,
  `alternativa_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKt8ku7emvoa52qjkr71eyr7jim` (`questao_id`),
  KEY `FK3vvmv0s38wd9qyscvayim8goc` (`alternativa_id`),
  KEY `FKinl8km6rml8sjq9hgehg9rdgk` (`usuario_id`),
  CONSTRAINT `FK3vvmv0s38wd9qyscvayim8goc` FOREIGN KEY (`alternativa_id`) REFERENCES `alternativa` (`id`),
  CONSTRAINT `FKinl8km6rml8sjq9hgehg9rdgk` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`),
  CONSTRAINT `FKt8ku7emvoa52qjkr71eyr7jim` FOREIGN KEY (`questao_id`) REFERENCES `questao` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `respota_usuario`
--

LOCK TABLES `respota_usuario` WRITE;
/*!40000 ALTER TABLE `respota_usuario` DISABLE KEYS */;
/*!40000 ALTER TABLE `respota_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unidade`
--

DROP TABLE IF EXISTS `unidade`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `unidade` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `capitulo` varchar(255) DEFAULT NULL,
  `materia_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK9v9wwcg0hka28bi52fv1ahfpf` (`materia_id`),
  CONSTRAINT `FK9v9wwcg0hka28bi52fv1ahfpf` FOREIGN KEY (`materia_id`) REFERENCES `materia` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unidade`
--

LOCK TABLES `unidade` WRITE;
/*!40000 ALTER TABLE `unidade` DISABLE KEYS */;
INSERT INTO `unidade` VALUES (2,'Funções',4),(3,'Fração',4),(4,'Força',6),(5,'Oxicidação',7);
/*!40000 ALTER TABLE `unidade` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `data_nascimento_` date DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `senha` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario`
--

LOCK TABLES `usuario` WRITE;
/*!40000 ALTER TABLE `usuario` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuario_materia`
--

DROP TABLE IF EXISTS `usuario_materia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario_materia` (
  `usuario_id` bigint NOT NULL,
  `materia_id` bigint NOT NULL,
  KEY `FKc14477boom5yk5x0dl54bdf88` (`materia_id`),
  KEY `FKbeup0oto2h13h6smija0n793h` (`usuario_id`),
  CONSTRAINT `FKbeup0oto2h13h6smija0n793h` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`),
  CONSTRAINT `FKc14477boom5yk5x0dl54bdf88` FOREIGN KEY (`materia_id`) REFERENCES `materia` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuario_materia`
--

LOCK TABLES `usuario_materia` WRITE;
/*!40000 ALTER TABLE `usuario_materia` DISABLE KEYS */;
/*!40000 ALTER TABLE `usuario_materia` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-08 22:42:26
