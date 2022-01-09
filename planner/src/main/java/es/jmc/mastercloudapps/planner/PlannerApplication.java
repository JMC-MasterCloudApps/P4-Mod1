package es.jmc.mastercloudapps.planner;

import java.util.concurrent.Executor;
import org.springframework.amqp.core.Queue;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@EnableAsync
@EnableFeignClients
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

	@Bean
	public Executor taskExecutor() {
		ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
		executor.setCorePoolSize(8);
		executor.setMaxPoolSize(8);
		executor.setQueueCapacity(500);
		executor.initialize();
		return executor;
	}
}
