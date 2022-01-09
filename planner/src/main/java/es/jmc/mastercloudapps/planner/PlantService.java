package es.jmc.mastercloudapps.planner;

import static es.jmc.mastercloudapps.planner.PlannerApplication.NEW_PLANT_QUEUE;
import static es.jmc.mastercloudapps.planner.PlannerApplication.PLANT_PROGRESS_QUEUE;
import static java.security.SecureRandom.getInstanceStrong;
import static org.springframework.boot.json.JsonParserFactory.getJsonParser;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import es.jmc.mastercloudapps.planner.topo.TopoService;
import es.jmc.mastercloudapps.planner.weather.WeatherService;
import java.security.NoSuchAlgorithmException;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor(onConstructor = @__(@Autowired))
public class PlantService {

	private static final String PLANNING_KEY = "planning";
	private static final String ID = "id";
	private static final long WAITING_TIME = 500L;

	private final RabbitTemplate rabbitTemplate;
	private final WeatherService weatherService;
	private final TopoService topoService;
	private final PlanningService planningService;

	Map<Integer, String> planningById = new ConcurrentHashMap<>();

	@Async
	@RabbitListener(queues = NEW_PLANT_QUEUE, ackMode = "AUTO")
	public void readNewPlantRequest(String message) throws InterruptedException, NoSuchAlgorithmException {
		log.info("Message received in channel '{}': '{}'", NEW_PLANT_QUEUE, message);
		Map<String, Object> queueMessage = getJsonParser().parseMap(message);

		final var plantId = (Integer) queueMessage.get(ID);
		var resultingPlanning = (String) queueMessage.get(PLANNING_KEY);
		planningById.put(plantId, resultingPlanning);

		final var city = (String) queueMessage.get("city");

		var landscape = topoService.getLandscape(city)
				.thenAccept(planning -> addPlanning(plantId, planning))
				.thenRun(() -> publishCompletionProgress(queueMessage, plantId));
		var weather = weatherService.getWeather(city)
				.thenAccept(planning -> addPlanning(plantId, planning))
				.thenRun(() -> publishCompletionProgress(queueMessage, plantId));

		// simulate waiting from 0% to 25%
		Thread.sleep(WAITING_TIME + getInstanceStrong().nextLong(WAITING_TIME));
		publishCompletionProgress(queueMessage, "25%", plantId);

		CompletableFuture.allOf(landscape, weather).join();
		resultingPlanning = planningService.process(planningById.get(plantId));
		planningById.put(plantId, resultingPlanning);
		publishCompletionProgress(queueMessage, "100%", plantId);
	}

	private void addPlanning(Integer plantId, String planning) {

		String currentPlanning = planningById.get(plantId);
		planningById.put(plantId, currentPlanning + "-" + planning);
		log.info("addPlanning: '{}'", planningById.get(plantId));
	}

	private void publishCompletionProgress(final Map<String, Object> queueMessage, Integer plantId) {

		boolean isLastOne = StringUtils.countOccurrencesOf(planningById.get(plantId), "-") == 2;

		queueMessage.put("completed", false);
		queueMessage.put(PLANNING_KEY, null);
		queueMessage.put("progress", isLastOne ? "75%" : "50%");
		publish(queueMessage);
	}

	private void publishCompletionProgress(final Map<String, Object> queueMessage, String completion, Integer plantId) {

		queueMessage.put("completed", "100%".equals(completion));
		queueMessage.put(PLANNING_KEY, "100%".equals(completion) ? planningById.get(plantId) : null);
		queueMessage.put("progress", completion);
		publish(queueMessage);
	}

	private void publish(final Map<String, Object> queueMessage) {
		final var json = mapToJson(queueMessage);
		log.info("Sending message in channel '{}': '{}'", PLANT_PROGRESS_QUEUE, json);
		rabbitTemplate.convertAndSend(PLANT_PROGRESS_QUEUE, json);
	}

	private String mapToJson(final Map<String, Object> queueMessage) {
		try {
			var objectMapper = new ObjectMapper();
			return objectMapper.writeValueAsString(queueMessage);

		} catch (JsonProcessingException e) {
			log.error("Error processing mapToJSON", e);
			return "";
		}
	}
}
