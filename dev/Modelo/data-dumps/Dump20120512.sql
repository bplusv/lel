CREATE DATABASE  IF NOT EXISTS `lel` /*!40100 DEFAULT CHARACTER SET utf8 COLLATE utf8_bin */;
USE `lel`;
-- MySQL dump 10.13  Distrib 5.5.16, for Win32 (x86)
--
-- Host: localhost    Database: lel
-- ------------------------------------------------------
-- Server version	5.5.23

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `concept`
--

LOCK TABLES `concept` WRITE;
/*!40000 ALTER TABLE `concept` DISABLE KEYS */;
INSERT INTO `concept` VALUES (1,1,'Universidad de California en San Diego',1),(2,1,'hidrogel',2),(3,1,'velcro',3),(4,1,'polimeros',1),(5,1,'La autocuración',2);
/*!40000 ALTER TABLE `concept` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `concept_event`
--

LOCK TABLES `concept_event` WRITE;
/*!40000 ALTER TABLE `concept_event` DISABLE KEYS */;
INSERT INTO `concept_event` VALUES (1,'create'),(3,'delete'),(2,'edit');
/*!40000 ALTER TABLE `concept_event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `concept_details`
--

LOCK TABLES `concept_details` WRITE;
/*!40000 ALTER TABLE `concept_details` DISABLE KEYS */;
INSERT INTO `concept_details` VALUES (1,'Universidad de alto prestigio','encargada de hacer estudios sobre materiales de gran impacto','Preparar estudiantes capacitados para la investigacion','Participar en concursos y realizar publicaciones',1,1,1),(2,'gel a base de agua','gel que se adhiere facilmente a varias superficies','Ser utilizado para investigaciones academicas','Ser utilizado en la industria con diversos fines',1,2,2),(3,'es necesario hacer preguntas al expertos','Curarse mediante los propios medios del individuo','intención actual','intención futura',1,3,3);
/*!40000 ALTER TABLE `concept_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'yanet','yanet'),(2,'luis','luis');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `concept_category`
--

LOCK TABLES `concept_category` WRITE;
/*!40000 ALTER TABLE `concept_category` DISABLE KEYS */;
INSERT INTO `concept_category` VALUES (2,'object'),(1,'state'),(3,'subject'),(4,'verb');
/*!40000 ALTER TABLE `concept_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `concept_classification`
--

LOCK TABLES `concept_classification` WRITE;
/*!40000 ALTER TABLE `concept_classification` DISABLE KEYS */;
INSERT INTO `concept_classification` VALUES (3,'general'),(1,'requirement'),(2,'system');
/*!40000 ALTER TABLE `concept_classification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `document`
--

LOCK TABLES `document` WRITE;
/*!40000 ALTER TABLE `document` DISABLE KEYS */;
INSERT INTO `document` VALUES (1,'Un equipo de la Escuela Jacobs de Ingeniería de la Universidad de California en San Diego');
/*!40000 ALTER TABLE `document` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `concept_log`
--

LOCK TABLES `concept_log` WRITE;
/*!40000 ALTER TABLE `concept_log` DISABLE KEYS */;
INSERT INTO `concept_log` VALUES (1,'2012-12-12 14:00:00',1,1,1),(2,'2012-12-12 14:30:00',2,2,2);
/*!40000 ALTER TABLE `concept_log` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2012-05-12 20:22:13