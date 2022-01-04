package es.jmc.mastercloudapps.planner;

import org.springframework.amqp.core.Queue;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
public class PlannerApplication {

	public static final String NEW_PLANT_QUEUE = "eoloplantCreationRequests";
	public static final String PLANT_PROGRESS_QUEUE = "eoloplantCreationProgressNotifications";

	public static void main(String[] args) {
		SpringApplication.run(PlannerApplication.class, args);
	}

	@Bean
	public Queue newPlantQueue() {
		return new Queue(NEW_PLANT_QUEUE, false);
	}

	@Bean
	public Queue plantProgressQueue() {
		return new Queue(PLANT_PROGRESS_QUEUE, false);
	}
}
