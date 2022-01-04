package es.jmc.mastercloudapps.planner;

import static es.jmc.mastercloudapps.planner.PlannerApplication.NEW_PLANT_QUEUE;
import static es.jmc.mastercloudapps.planner.PlannerApplication.PLANT_PROGRESS_QUEUE;
import static java.lang.String.format;
import static java.security.SecureRandom.getInstanceStrong;

import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Random;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class PlantService {

	private static final String NOTIFY_MSG =
		"""
		{
		"id":1,
		"city":"Madrid",
		"progress": %d,
		"completed": %s,
		"planning": null
		}
		""";

	private final RabbitTemplate rabbitTemplate;

	@RabbitListener(queues = NEW_PLANT_QUEUE, ackMode = "AUTO")
	public void readNewPlantRequest(String message) throws InterruptedException, NoSuchAlgorithmException {

		log.info("Message received in channel '{}': '{}'", NEW_PLANT_QUEUE, message);
		var random = getInstanceStrong().nextInt(2000);
		Thread.sleep(random);
		notifyNewPlantProgress(format(NOTIFY_MSG, 25, false));

		random = getInstanceStrong().nextInt(2000);
		Thread.sleep(random);
		notifyNewPlantProgress(format(NOTIFY_MSG, 50, false));

		random = getInstanceStrong().nextInt(2000);
		Thread.sleep(random);
		notifyNewPlantProgress(format(NOTIFY_MSG, 75, false));

		random = getInstanceStrong().nextInt(2000);
		Thread.sleep(random);
		notifyNewPlantProgress(format(NOTIFY_MSG, 100, true));
	}

	public void notifyNewPlantProgress(String message) {

		log.info("Sending message in channel '{}': '{}'", PLANT_PROGRESS_QUEUE, message);
		rabbitTemplate.convertAndSend(PLANT_PROGRESS_QUEUE, message);
	}
}
