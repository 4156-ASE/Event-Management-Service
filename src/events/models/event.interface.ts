/**
 * Event Interface which is used to describe the structure of a event object.
 */
export interface EventInterface {
  /**
   * Event ID. Generated by database.
   */
  id: string;
  /**
   * Event title. Required.
   */
  title: string;
  /**
   * Event description. Optional.
   */
  desc: string;
  /**
   * Event start time. Required.
   */
  start_time: Date;
  /**
   * Event end time. Required.
   */
  end_time: Date;
  /**
   * Event location. Optional.
   */
  location: string;
}
