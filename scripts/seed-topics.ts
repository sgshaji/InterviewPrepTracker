import { db } from "../server/db";
import { eq, sql } from "drizzle-orm";
import { topics, preparationSessions } from "../shared/schema";

async function seedTopicsFromSessions() {
  try {
    console.log("🌱 Seeding topics from existing preparation sessions...");
    
    // Get all unique topics from preparation sessions
    const uniqueTopics = await db
      .selectDistinct({ topic: preparationSessions.topic })
      .from(preparationSessions);
    
    console.log(`Found ${uniqueTopics.length} unique topics in preparation sessions:`, 
      uniqueTopics.map(t => t.topic));
    
    // For each unique topic, check if it exists in topics table, if not create it
    for (const { topic } of uniqueTopics) {
      if (!topic) continue;
      
      // Check if topic already exists for user 1 (demo user)
      const existingTopic = await db
        .select()
        .from(topics)
        .where(sql`${topics.userId} = 1 AND LOWER(${topics.name}) = LOWER(${topic})`);
      
      if (existingTopic.length === 0) {
        await db.insert(topics).values({
          userId: 1, // Demo user ID
          name: topic
        });
        console.log(`✅ Created topic: ${topic}`);
      } else {
        console.log(`⏭️ Topic already exists: ${topic}`);
      }
    }
    
    // Also ensure default topics exist
    const defaultTopics = [
      "Behavioral",
      "Product Thinking", 
      "Analytical Thinking",
      "Product Portfolio",
      "Technical Skills",
      "Case Studies",
      "System Design",
      "Leadership",
      "Communication",
      "Market Research"
    ];
    
    for (const topicName of defaultTopics) {
      const existingTopic = await db
        .select()
        .from(topics)
        .where(sql`${topics.userId} = 1 AND LOWER(${topics.name}) = LOWER(${topicName})`);
      
      if (existingTopic.length === 0) {
        await db.insert(topics).values({
          userId: 1,
          name: topicName
        });
        console.log(`✅ Created default topic: ${topicName}`);
      }
    }
    
    // Show final topics list
    const allTopics = await db
      .select()
      .from(topics)
      .where(eq(topics.userId, 1))
      .orderBy(topics.createdAt);
    
    console.log("\n📋 Final topics list:");
    allTopics.forEach(topic => {
      console.log(`  - ${topic.name} (ID: ${topic.id})`);
    });
    
    console.log("\n🎉 Topic seeding completed successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding topics:", error);
    throw error;
  }
}

// Run the seeding function
seedTopicsFromSessions()
  .then(() => {
    console.log("✅ Seeding process completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }); 